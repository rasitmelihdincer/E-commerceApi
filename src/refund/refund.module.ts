import { Module } from '@nestjs/common';
import { RefundService } from './refund.service';
import { RefundController } from './refund.controller';
import { RefundRepository } from './refund.repository';
import { PaymentModule } from '../payment/payment.module';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PaymentModule, PrismaModule, AuthModule],
  controllers: [RefundController],
  providers: [RefundService, RefundRepository],
  exports: [RefundService],
})
export class RefundModule {}
