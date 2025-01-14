import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ProductController } from './product/product.controller';
import { APP_GUARD } from '@nestjs/core';
import { CustomerModule } from './customer/customer.module';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { AuthModule } from './auth/auth.module';
import { AddressModule } from './address/address.module';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import * as path from 'path';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './shared/redis/redis.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ProductImageModule } from './product-image/product-image.module';
import { AdminModule } from './admin/admin.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ProductModule,
    CustomerModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      resolvers: [AcceptLanguageResolver],
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    AddressModule,
    CartModule,
    CategoryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    RedisModule,
    ProductImageModule,
    AdminModule,
    OrderModule,
    PaymentModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
