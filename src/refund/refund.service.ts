import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { RefundRepository } from './refund.repository';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { UpdateRefundStatusDto } from './dto/update-refund-status.dto';
import { PaymentService } from '../payment/payment.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import {
  OrderStatus,
  PaymentStatus,
  RefundStatus,
  SessionType,
} from '@prisma/client';

interface UserInfo {
  id: number;
  type: SessionType;
}

@Injectable()
export class RefundService {
  constructor(
    private readonly refundRepository: RefundRepository,
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    createRefundRequestDto: CreateRefundRequestDto,
    customerId: number,
  ) {
    // OrderItem kontrolü
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: createRefundRequestDto.orderItemId },
      include: {
        Order: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException(
        `OrderItem #${createRefundRequestDto.orderItemId} not found`,
      );
    }

    // Siparişin müşteriye ait olup olmadığını kontrol et
    if (orderItem.Order.customerId !== customerId) {
      throw new ForbiddenException(
        'You can only request refund for your own orders',
      );
    }

    // Miktar kontrolü
    if (createRefundRequestDto.quantity > orderItem.quantity) {
      throw new BadRequestException(
        `Refund quantity cannot be greater than order quantity`,
      );
    }

    // Sipariş durumu kontrolü
    if (orderItem.Order.status !== OrderStatus.PAID) {
      throw new BadRequestException(
        `Order must be in PAID status to request refund`,
      );
    }

    const existingRefunds = await this.refundRepository.findByOrderItemId(
      orderItem.id,
    );
    const totalRefundedQuantity = existingRefunds.reduce((sum, refund) => {
      if (refund.status !== RefundStatus.REJECTED) {
        return sum + refund.quantity;
      }
      return sum;
    }, 0);

    if (
      totalRefundedQuantity + createRefundRequestDto.quantity >
      orderItem.quantity
    ) {
      throw new BadRequestException(
        `Total refund quantity cannot exceed order quantity`,
      );
    }

    return this.refundRepository.create(createRefundRequestDto);
  }

  async findAll() {
    return this.refundRepository.findAll();
  }

  async findAllByStatus(status: string) {
    const refunds = await this.refundRepository.findAll();
    return refunds.filter((refund) => refund.status === status.toUpperCase());
  }

  async findByCustomerId(customerId: number) {
    const refunds = await this.refundRepository.findAll();
    return refunds.filter(
      (refund) => refund.orderItem.Order.customerId === customerId,
    );
  }

  async findOne(id: number, user: UserInfo) {
    const refundRequest = await this.refundRepository.findOne(id);
    if (!refundRequest) {
      throw new NotFoundException(`Refund request #${id} not found`);
    }

    // Admin değilse ve kendi talebi değilse erişimi engelle
    if (
      user.type !== SessionType.ADMIN &&
      refundRequest.orderItem.Order.customerId !== user.id
    ) {
      throw new ForbiddenException(
        'You can only view your own refund requests',
      );
    }

    return refundRequest;
  }

  async updateStatus(id: number, updateRefundStatusDto: UpdateRefundStatusDto) {
    const refundRequest = await this.findOne(id, {
      id: 0,
      type: SessionType.ADMIN,
    }); // Admin olarak kontrol et

    if (refundRequest.status !== RefundStatus.PENDING) {
      throw new BadRequestException(
        'This refund request has already been processed',
      );
    }

    const updatedRefundRequest = await this.refundRepository.updateStatus(
      id,
      updateRefundStatusDto,
    );

    if (updateRefundStatusDto.status === RefundStatus.APPROVED) {
      const orderItem = await this.prisma.orderItem.findUnique({
        where: { id: refundRequest.orderItemId },
        include: {
          Order: {
            include: {
              payment: {
                where: {
                  status: PaymentStatus.COMPLETED,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
              },
            },
          },
        },
      });

      if (!orderItem || !orderItem.Order) {
        throw new NotFoundException('Order not found');
      }

      const completedPayment = orderItem.Order.payment[0];
      if (!completedPayment) {
        throw new BadRequestException(
          'No completed payment found for this order',
        );
      }

      // İade işlemini başlat
      await this.paymentService.refundPayment(completedPayment.id);

      // Sipariş durumunu güncelle
      await this.prisma.order.update({
        where: { id: orderItem.Order.id },
        data: { status: OrderStatus.REFUNDED },
      });
    }

    return updatedRefundRequest;
  }
}
