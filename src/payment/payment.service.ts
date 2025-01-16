import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CartRepository } from 'src/cart/cart.repository';
import { MailService } from '../mail/mail.service';
import { Create3DDto } from './dto/create-payment.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import {
  Payment,
  Order,
  OrderItem,
  Product,
  PaymentStatus,
  OrderStatus,
} from '@prisma/client';
import axios from 'axios';
import { PaymentFactory } from './providers/payment-factory.service';

interface OrderWithItems extends Order {
  orderItems: OrderItem[];
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartRepository: CartRepository,
    private readonly mailService: MailService,
    private readonly paymentFactory: PaymentFactory,
  ) {}

  /**
   * create3DSecurePayment
   * Gelecekte farklı bir ödeme sağlayıcısı kullanılabilir.
   * PaymentFactory içinden ilgili provider seçilir, create3DForm metodu çağrılır.
   */
  async create3DSecurePayment(dto: Create3DDto): Promise<any> {
    // 1) Sipariş ve müşteri validasyonu
    const order = await this.validateOrder(dto.orderId);
    const customer = await this.getCustomer(order.customerId);

    // 2) Sipariş kalemleri ve ürünleri al
    const { orderItems, products } = await this.getOrderItemsWithProducts(
      order.id,
    );

    // 3) Stok kontrolü
    this.checkStockAvailability(orderItems, products);

    // 4) Payment kaydı oluştur
    const payment = await this.createPaymentRecord(
      order.id,
      order.totalPrice,
      dto.currency_code,
      dto.installments_number,
    );

    // 5) Provider seç ve ödeme isteği oluştur
    const paymentProvider = this.paymentFactory.getProvider('paybull');
    // ileride 'iyzico', 'stripe' vb. parametreli seçimler de yapılabilir

    // 6) Provider’ın create3DForm metodunu çağır
    const response = await paymentProvider.create3DForm({
      ...dto,
      invoice_id: `ORDER_${order.id}`,
      invoice_description: `Order #${order.id} Payment`,
      name: customer.firstName,
      surname: customer.lastName,
      total: Number(order.totalPrice),
      return_url: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/result/success`,
      cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/result/cancel`,
      items: JSON.stringify(
        orderItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            name: product.productName,
            price: Number(item.price).toFixed(2),
            quantity: item.quantity,
            description: product.productDescription || product.productName,
          };
        }),
      ),
    });

    // 7) PayBull cevabını payment kaydına ekle
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        paybullData: response,
      },
    });

    return response;
  }

  /**
   * handlePaymentResult
   * 3D ödeme sonucunu karşılayan fonksiyon.
   */
  async handlePaymentResult(resultData: any, isSuccess: boolean): Promise<any> {
    this.logger.debug(
      `Processing payment result: ${JSON.stringify(resultData)}`,
    );

    // 1) Order ID'yi al
    const invoiceStr = resultData.invoice_id || '';
    const orderId = parseInt(invoiceStr.replace('ORDER_', ''), 10);

    if (!orderId || isNaN(orderId)) {
      this.logger.error(`Invalid invoice_id format: ${invoiceStr}`);
      throw new BadRequestException(`Invalid invoice_id format: ${invoiceStr}`);
    }

    // 2) Payment kaydını bul
    const payment = await this.prisma.payment.findFirst({
      where: {
        orderId: orderId,
        status: PaymentStatus.PENDING,
      },
    });

    // 3) Provider seçimi
    const paymentProvider = this.paymentFactory.getProvider('paybull');

    try {
      // 4) PayBull status check
      const statusResponse = await paymentProvider.checkPaymentStatus(
        resultData.invoice_id,
      );
      this.logger.debug(
        `Payment status check response: ${JSON.stringify(statusResponse)}`,
      );

      // Başarılı ödeme
      if (statusResponse.status_code === 100) {
        const order = await this.prisma.order.findUnique({
          where: { id: orderId },
          include: {
            orderItems: true,
          },
        });

        if (!order) {
          throw new Error(`Order not found: ${orderId}`);
        }

        // Başarılı ödeme işlenir
        await this.handleSuccessfulPayment(
          payment,
          order,
          statusResponse,
          resultData,
        );
        return this.formatPaymentResponse(resultData, statusResponse);
      }
      // Başarısız ödeme
      else if (statusResponse.status_code === 41) {
        if (payment) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.FAILED,
              paybullData: statusResponse,
              transactionId: resultData.transaction_id || undefined,
            },
          });
        }

        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.CANCELLED,
          },
        });

        return {
          success: false,
          error: statusResponse.error || 'Payment failed',
          data: this.formatPaymentResponse(resultData, statusResponse).data,
        };
      }
      // Bekleyen ödeme
      else {
        return {
          success: false,
          error: 'Payment is pending',
          data: this.formatPaymentResponse(resultData, statusResponse).data,
        };
      }
    } catch (error) {
      this.logger.error(
        `Error checking payment status for invoice ${resultData.invoice_id}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * findAll
   * Ödeme kayıtlarını pagine olarak getirir.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        include: {
          order: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.payment.count(),
    ]);

    // Yanıtı formatla
    const formattedPayments = await Promise.all(
      payments.map(async (payment) => {
        const orderItems = await this.prisma.orderItem.findMany({
          where: { orderId: payment.orderId },
          include: { product: true },
        });

        return {
          ...payment,
          amount: Number(payment.amount),
          order: {
            ...payment.order,
            totalPrice: Number(payment.order.totalPrice),
            orderItems: orderItems.map((item) => ({
              ...item,
              price: Number(item.price),
            })),
          },
        };
      }),
    );

    return {
      data: formattedPayments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * findOne
   * Tek bir payment kaydı getirir.
   */
  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment #${id} not found`);
    }

    // Order items'ları ayrı çek
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId: payment.orderId },
      include: { product: true },
    });

    // Decimal değerleri number'a çevir
    return {
      ...payment,
      amount: Number(payment.amount),
      order: {
        ...payment.order,
        totalPrice: Number(payment.order.totalPrice),
        orderItems: orderItems.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      },
    };
  }

  /**
   * findByOrderId
   * Bir order ID üzerindeki tüm payment kayıtlarını listeler.
   */
  async findByOrderId(orderId: number) {
    const payments = await this.prisma.payment.findMany({
      where: { orderId },
      include: {
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Her payment için order items'ları çek
    const formattedPayments = await Promise.all(
      payments.map(async (payment) => {
        const orderItems = await this.prisma.orderItem.findMany({
          where: { orderId: payment.orderId },
          include: { product: true },
        });

        return {
          ...payment,
          amount: Number(payment.amount),
          order: {
            ...payment.order,
            totalPrice: Number(payment.order.totalPrice),
            orderItems: orderItems.map((item) => ({
              ...item,
              price: Number(item.price),
            })),
          },
        };
      }),
    );
    return formattedPayments;
  }

  /**
   * findByCustomerId
   * Bir müşteri ID'sine ait ödeme kayıtlarını sayfa sayfa getirir.
   */
  async findByCustomerId(customerId: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        where: {
          order: {
            customerId,
          },
        },
        include: {
          order: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.payment.count({
        where: {
          order: {
            customerId,
          },
        },
      }),
    ]);

    // Her payment için order items'ları çek
    const formattedPayments = await Promise.all(
      payments.map(async (payment) => {
        const orderItems = await this.prisma.orderItem.findMany({
          where: { orderId: payment.orderId },
          include: { product: true },
        });

        return {
          ...payment,
          amount: Number(payment.amount),
          order: {
            ...payment.order,
            totalPrice: Number(payment.order.totalPrice),
            orderItems: orderItems.map((item) => ({
              ...item,
              price: Number(item.price),
            })),
          },
        };
      }),
    );

    return {
      data: formattedPayments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * getPaymentStatistics
   * Ödeme istatistiklerini döner (toplam tutar, günlük tutar, başarı oranları vb.).
   */
  async getPaymentStatistics() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [totalPayments, todayPayments, completedPayments, failedPayments] =
      await Promise.all([
        // Toplam ödeme tutarı
        this.prisma.payment.aggregate({
          where: { status: PaymentStatus.COMPLETED },
          _sum: { amount: true },
        }),
        // Bugünkü ödeme tutarı
        this.prisma.payment.aggregate({
          where: {
            status: PaymentStatus.COMPLETED,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        // Başarılı ödeme sayısı
        this.prisma.payment.count({
          where: { status: PaymentStatus.COMPLETED },
        }),
        // Başarısız ödeme sayısı
        this.prisma.payment.count({
          where: { status: PaymentStatus.FAILED },
        }),
      ]);

    return {
      totalAmount: totalPayments._sum.amount || 0,
      todayAmount: todayPayments._sum.amount || 0,
      completedCount: completedPayments,
      failedCount: failedPayments,
      successRate: completedPayments
        ? (completedPayments / (completedPayments + failedPayments)) * 100
        : 0,
    };
  }

  /**
   * refundPayment
   * Tam para iadesi sürecini yönetir.
   */
  async refundPayment(paymentId: number) {
    // 1) Payment ve Order bilgilerini al
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment #${paymentId} not found`);
    }

    // 2) Ödeme durumunu kontrol et
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(`Payment #${paymentId} is not completed`);
    }

    // 3) Provider seçimi
    const paymentProvider = this.paymentFactory.getProvider('paybull');

    // 4) İade işlemini gerçekleştir
    try {
      const refundResult = await paymentProvider.refund(
        Number(payment.amount),
        payment.orderId,
      );

      // 5) İade başarılı ise transaction içinde kayıtları güncelle
      await this.prisma.$transaction(async (prisma) => {
        // Payment kaydını güncelle
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.REFUNDED,
            paybullData: {
              ...(payment.paybullData as Record<string, any>),
              refund: refundResult,
            },
          },
        });

        // Sipariş durumunu güncelle
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: OrderStatus.REFUNDED,
          },
        });

        // Stokları geri ekle
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: payment.orderId },
          include: { product: true },
        });

        this.logger.debug(
          `Refund: Found ${orderItems.length} items to update stock`,
        );
        for (const item of orderItems) {
          this.logger.debug(
            `Refund: Updating stock for product ${item.productId} - Current stock: ${item.product.productStock}, Adding: ${item.quantity}`,
          );

          const updatedProduct = await prisma.product.update({
            where: { id: item.productId },
            data: {
              productStock: {
                increment: item.quantity,
              },
            },
          });

          this.logger.debug(
            `Refund: Stock updated for product ${item.productId} - New stock: ${updatedProduct.productStock}`,
          );
        }
      });

      return {
        success: true,
        message: 'Payment refunded successfully',
        data: refundResult,
      };
    } catch (error) {
      this.logger.error(`Refund Error => ${JSON.stringify(error)}`);
      throw new BadRequestException(error?.message || 'Refund failed');
    }
  }

  // ---------------------------------------------------
  // Özel Yardımcı Metodlar
  // ---------------------------------------------------
  private async validateOrder(orderId: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order (id=${orderId}) not found`);
    }

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException(`Order already paid`);
    }
    if (order.status === OrderStatus.REFUNDED) {
      throw new BadRequestException(`Order already refunded`);
    }
    return order;
  }

  private async getCustomer(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found for order ${customerId}`);
    }

    return customer;
  }

  private async getOrderItemsWithProducts(orderId: number): Promise<{
    orderItems: OrderItem[];
    products: Product[];
  }> {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId },
    });

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: orderItems.map((item) => item.productId),
        },
      },
    });

    return { orderItems, products };
  }

  private checkStockAvailability(orderItems: OrderItem[], products: Product[]) {
    for (const item of orderItems) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new NotFoundException(`Product not found: ${item.productId}`);
      }

      if (product.productStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.productName}. Available: ${product.productStock}, Requested: ${item.quantity}`,
        );
      }
    }
  }

  private async createPaymentRecord(
    orderId: number,
    totalPrice: Decimal,
    currency: string,
    installments: number,
  ): Promise<Payment> {
    return this.prisma.payment.create({
      data: {
        orderId,
        status: PaymentStatus.PENDING,
        amount: totalPrice,
        currency,
        installments,
      },
    });
  }

  /**
   * Başarılı ödeme sonrası yapılacak tüm işlemler burada toplanır.
   */
  private async handleSuccessfulPayment(
    paymentData: Payment,
    order: OrderWithItems,
    statusResponse: any,
    resultData: any,
  ) {
    // Transaction başlat
    await this.prisma.$transaction(async (prisma) => {
      // Payment güncelle
      let updatedPayment: Payment | null = null;
      if (paymentData) {
        updatedPayment = await prisma.payment.update({
          where: { id: paymentData.id },
          data: {
            status: PaymentStatus.COMPLETED,
            paybullData: statusResponse,
            transactionId: resultData.transaction_id || undefined,
          },
        });
      }

      // Order güncelle
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
        },
      });

      // Stokları düşür
      this.logger.debug(
        `Payment: Found ${order.orderItems.length} items to update stock`,
      );

      for (const item of order.orderItems) {
        const currentProduct = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        this.logger.debug(
          `Payment: Updating stock for product ${item.productId} - Current stock: ${currentProduct.productStock}, Removing: ${item.quantity}`,
        );

        const updatedProduct = await prisma.product.update({
          where: { id: item.productId },
          data: {
            productStock: {
              decrement: item.quantity,
            },
          },
        });

        this.logger.debug(
          `Payment: Stock updated for product ${item.productId} - New stock: ${updatedProduct.productStock}`,
        );
      }

      // Cart ve CartItems'ları temizle
      const cart = await prisma.cart.findFirst({
        where: { customerId: order.customerId },
        include: { cartItems: true },
      });

      if (cart) {
        this.logger.debug(
          `Payment: Cleaning up cart #${cart.id} with ${cart.cartItems.length} items`,
        );

        // Önce cart items'ları sil
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        this.logger.debug(`Payment: Cart items deleted successfully`);
      }

      // Müşteri bilgilerini al
      const customer = await prisma.customer.findFirst({
        where: { id: order.customerId },
      });

      // Başarılı ödeme maili gönder
      if (customer && updatedPayment) {
        await this.mailService.sendPaymentConfirmation(customer.email, {
          id: updatedPayment.id,
          amount: updatedPayment.amount,
          orderId: order.id,
          orderItems: order.orderItems,
        });
      }
    });
  }

  /**
   * Ödemeye dair veriyi kullanıcıya dönerken formatlamaya yarar.
   */
  private formatPaymentResponse(resultData: any, statusResponse: any) {
    return {
      success: true,
      message: 'Payment successful',
      data: {
        ...resultData,
        amount: parseFloat(resultData.amount).toFixed(2),
        installment: parseInt(resultData.installment),
        status_code: parseInt(resultData.status_code),
        payment_status: parseInt(resultData.payment_status),
        merchant_commission: parseFloat(resultData.merchant_commission),
        user_commission: parseFloat(resultData.user_commission),
        merchant_commission_percentage: parseFloat(
          resultData.merchant_commission_percentage,
        ),
        merchant_commission_fixed: parseFloat(
          resultData.merchant_commission_fixed,
        ),
        error_code: parseInt(resultData.error_code),
        status_check: statusResponse,
      },
    };
  }
}
