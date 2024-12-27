import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CustomerModule } from 'src/customer/customer.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { SessionRepository } from './session/session.repository';
import { SessionService } from './session/session.service';
import { AuthGuard } from './guards/auth.guard';
import { CustomerService } from 'src/customer/customer.service';
import { RedisModule } from 'src/shared/redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => CustomerModule),
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'super-secret-key'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionRepository, SessionService, AuthGuard],
  exports: [AuthService, SessionService],
})
export class AuthModule {}
