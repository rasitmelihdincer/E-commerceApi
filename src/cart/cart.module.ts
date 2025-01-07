import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartRepository } from './cart.repository';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule], // AuthModule ve PrismaModule içe aktarıldı
  controllers: [CartController], // CartController eklendi
  providers: [CartService, CartRepository], // Service ve Repository eklendi
  exports: [CartRepository], // CartRepository başka modüller için export edildi
})
export class CartModule {}
