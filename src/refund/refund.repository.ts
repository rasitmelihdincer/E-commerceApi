import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { UpdateRefundStatusDto } from './dto/update-refund-status.dto';
import { RefundRequest } from '@prisma/client';

@Injectable()
export class RefundRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createRefundRequestDto: CreateRefundRequestDto,
  ): Promise<RefundRequest> {
    return this.prisma.refundRequest.create({
      data: {
        ...createRefundRequestDto,
        status: 'PENDING',
      },
      include: {
        orderItem: {
          select: {
            id: true,
            quantity: true,
            price: true,
            Order: {
              select: {
                id: true,
                status: true,
                customerId: true,
              },
            },
            product: {
              select: {
                id: true,
                productName: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.refundRequest.findMany({
      include: {
        orderItem: {
          select: {
            id: true,
            quantity: true,
            price: true,
            Order: true,
            product: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.refundRequest.findUnique({
      where: { id },
      include: {
        orderItem: {
          select: {
            id: true,
            quantity: true,
            price: true,
            Order: {
              select: {
                id: true,
                status: true,
                customerId: true,
              },
            },
            product: {
              select: {
                id: true,
                productName: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }

  async findByOrderItemId(orderItemId: number) {
    return this.prisma.refundRequest.findMany({
      where: { orderItemId },
      include: {
        orderItem: {
          select: {
            id: true,
            quantity: true,
            price: true,
            Order: {
              select: {
                id: true,
                status: true,
                customerId: true,
              },
            },
            product: {
              select: {
                id: true,
                productName: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }

  async updateStatus(id: number, updateRefundStatusDto: UpdateRefundStatusDto) {
    return this.prisma.refundRequest.update({
      where: { id },
      data: {
        status: updateRefundStatusDto.status,
      },
      include: {
        orderItem: {
          select: {
            id: true,
            quantity: true,
            price: true,
            Order: {
              select: {
                id: true,
                status: true,
                customerId: true,
              },
            },
            product: {
              select: {
                id: true,
                productName: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }
}
