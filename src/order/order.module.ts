import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { CartModule } from 'src/cart/cart.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, CartModule, AuthModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService],
})
export class OrderModule {}
