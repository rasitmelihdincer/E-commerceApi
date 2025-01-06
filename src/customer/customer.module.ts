import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { CustomerController } from './customer.controller';
import { CustomerRepository } from './customer.repository';
import { CustomerService } from './customer.service';
import { CustomerMapper } from './mappers/customer.mapper';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [CustomerController],
  providers: [CustomerRepository, CustomerService, CustomerMapper],
  exports: [CustomerService],
})
export class CustomerModule {}
