import { ApiProperty } from '@nestjs/swagger';
import { OrderItem } from '@prisma/client';

export class RefundRequestEntity {
  @ApiProperty({ description: 'Unique identifier of the refund request' })
  id: number;

  @ApiProperty({ description: 'ID of the order item being refunded' })
  orderItemId: number;

  @ApiProperty({ description: 'Order item details' })
  orderItem: OrderItem;

  @ApiProperty({ description: 'Quantity requested for refund' })
  quantity: number;

  @ApiProperty({
    description: 'Description/reason for refund',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Current status of the refund request',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
  })
  status: string;

  @ApiProperty({ description: 'When the refund request was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the refund request was last updated' })
  updatedAt: Date;
}
