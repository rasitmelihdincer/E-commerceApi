import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RefundStatus } from '@prisma/client';

export class UpdateRefundStatusDto {
  @ApiProperty({
    description: 'New status of the refund request',
    enum: RefundStatus,
    example: 'APPROVED',
  })
  @IsEnum(RefundStatus, {
    message: 'Status must be one of: PENDING, APPROVED, REJECTED, COMPLETED',
  })
  status: RefundStatus;
}
