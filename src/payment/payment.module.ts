import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentFactoryService } from './providers/payment-factory.service';
import { PaybullProvider } from './providers/paybull/paybull.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentFactoryService, PaybullProvider],
  exports: [PaymentService],
})
export class PaymentModule {}
