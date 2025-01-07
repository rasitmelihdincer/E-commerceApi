import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { CartModule } from 'src/cart/cart.module';
import { CartRepository } from 'src/cart/cart.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, CartModule, AuthModule], // CartModule ve PrismaModule içe aktarıldı
  controllers: [OrderController], // OrderController eklendi
  providers: [OrderService, OrderRepository], // Service ve Repository eklendi
  exports: [OrderService], // Sadece OrderService export edildi (CartRepository yanlış bir export olur burada)
})
export class OrderModule {}
