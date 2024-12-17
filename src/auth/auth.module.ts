import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CustomerModule } from 'src/customer/customer.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { SessionRepository } from './session/session.repository';
import { SessionService } from './session/session.service';
import { AuthGuard } from './guards/auth.guard';
import { CustomerService } from 'src/customer/customer.service';

@Module({
  imports: [PrismaModule, forwardRef(() => CustomerModule)],
  controllers: [AuthController],
  providers: [AuthService, SessionRepository, SessionService, AuthGuard],
  exports: [AuthService, SessionService],
})
export class AuthModule {}
