import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ProductController } from './product/product.controller';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [ProductModule , ThrottlerModule.forRoot([{
    ttl: 60000,
    limit: 10,
  }])],
  controllers: [AppController],
  providers: [AppService , {
    provide: APP_GUARD,
    useClass: ThrottlerGuard, 
  },
],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)  
      // Tüm modüller için "*"
      // Özellikle belirli bir controller için direkt olarak controller örnegin ProductController
      .forRoutes("*");  
  }
}
