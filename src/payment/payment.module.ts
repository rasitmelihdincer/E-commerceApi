import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaybullProvider } from './providers/paybull/paybull.provider';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { CartModule } from 'src/cart/cart.module';
import { MailModule } from '../mail/mail.module';
import { PaymentFactory } from './providers/payment-factory.service';

@Module({
  imports: [ConfigModule, PrismaModule, HttpModule, CartModule, MailModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaybullProvider, PaymentFactory],
  exports: [PaymentService],
})
export class PaymentModule {}
