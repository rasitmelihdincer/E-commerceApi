// src/payment/payment.service.ts
import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PaybullProvider } from './providers/paybull/paybull.provider';
import { Create3DDto } from './dto/create-payment.dto';
import {
  generateHashKey,
  generateRefundHashKey,
} from 'src/common/utils/hash-key-generate';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CartRepository } from 'src/cart/cart.repository';
import { PayBullRequest } from './providers/payment-provider.interface';
import { Order, OrderItem, Payment, Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import axios from 'axios';
import { MailService } from '../mail/mail.service';

interface OrderWithItems extends Order {
  orderItems: OrderItem[];
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paybullProvider: PaybullProvider,
    private readonly prisma: PrismaService,
    private readonly cartRepository: CartRepository,
    private readonly mailService: MailService,
  ) {}

  async getPaybullToken(): Promise<string> {
    return this.paybullProvider.getToken();
  }

  private async validateOrder(orderId: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order (id=${orderId}) not found`);
    }

    if (order.status === 'PAID') {
      throw new BadRequestException(`Order already paid`);
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

  private validateStock(orderItems: OrderItem[], products: Product[]) {
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

  private createPaymentRequest(
    dto: Create3DDto,
    order: Order,
    customer: { firstName: string; lastName: string },
    orderItems: OrderItem[],
    products: Product[],
  ): PayBullRequest {
    return {
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
      hash_key: '',
    };
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
        status: 'PENDING',
        amount: totalPrice,
        currency,
        installments,
      },
    });
  }

  private generatePaymentHashKey(paymentRequest: PayBullRequest): string {
    const hashKey = generateHashKey(
      paymentRequest.total.toFixed(2),
      paymentRequest.installments_number.toString(),
      paymentRequest.currency_code,
      this.paybullProvider.getMerchantKey(),
      paymentRequest.invoice_id,
      this.paybullProvider.getAppSecret(),
    );

    this.logger.debug(
      `Generated hash key for invoice ${paymentRequest.invoice_id}: ${hashKey}`,
    );

    return hashKey;
  }

  async create3DSecurePayment(dto: Create3DDto): Promise<any> {
    // 1) Sipariş ve müşteri validasyonları
    const order = await this.validateOrder(dto.orderId);
    const customer = await this.getCustomer(order.customerId);

    // 2) Sipariş kalemleri ve ürünleri al
    const { orderItems, products } = await this.getOrderItemsWithProducts(
      order.id,
    );

    // 3) Stok kontrolü
    this.validateStock(orderItems, products);

    // 4) PayBull için ödeme isteği hazırla
    const paymentRequest = this.createPaymentRequest(
      dto,
      order,
      customer,
      orderItems,
      products,
    );

    // 5) Payment kaydı oluştur
    const payment = await this.createPaymentRecord(
      order.id,
      order.totalPrice,
      dto.currency_code,
      dto.installments_number,
    );

    // 6) Hash key oluştur ve ekle
    paymentRequest.hash_key = this.generatePaymentHashKey(paymentRequest);

    // 7) PayBull'a ödeme isteği gönder
    const response = await this.paybullProvider.create3DForm(paymentRequest);

    // 8) PayBull cevabını kaydet
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        paybullData: response,
      },
    });

    return response;
  }

  private async processSuccessfulPayment(
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
            status: 'COMPLETED',
            paybullData: statusResponse,
            transactionId: resultData.transaction_id || undefined,
          },
        });
      }

      // Order güncelle
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
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

        this.logger.debug(`Payment: Cart  items deleted successfully`);
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
        status: 'PENDING',
      },
    });

    // 3) PayBull status check
    try {
      const statusResponse = await this.paybullProvider.checkPaymentStatus(
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

        await this.processSuccessfulPayment(
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
              status: 'FAILED',
              paybullData: statusResponse,
              transactionId: resultData.transaction_id || undefined,
            },
          });
        }

        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
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

  async getPaymentStatistics() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [totalPayments, todayPayments, completedPayments, failedPayments] =
      await Promise.all([
        // Toplam ödeme tutarı
        this.prisma.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        // Bugünkü ödeme tutarı
        this.prisma.payment.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _sum: { amount: true },
        }),
        // Başarılı ödeme sayısı
        this.prisma.payment.count({
          where: { status: 'COMPLETED' },
        }),
        // Başarısız ödeme sayısı
        this.prisma.payment.count({
          where: { status: 'FAILED' },
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
    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException(`Payment #${paymentId} is not completed`);
    }

    try {
      // 3) PayBull üzerinden iade işlemini gerçekleştir
      const refundResult = await this.paybullProvider.refund(
        Number(payment.amount),
        payment.orderId,
      );

      // 4) İade başarılı ise kayıtları güncelle
      await this.prisma.$transaction(async (prisma) => {
        // Payment kaydını güncelle
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'REFUNDED',
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
            status: 'REFUNDED',
          },
        });

        // Stokları geri ekle
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: payment.orderId },
          include: {
            product: true,
          },
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
}
