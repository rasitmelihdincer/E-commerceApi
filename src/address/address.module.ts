import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressMapper } from './mappers/address.mapper';
import { AddressRepository } from './address.repository';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AddressController],
  providers: [AddressRepository, AddressService, AddressMapper],
  exports: [AddressService],
})
export class AddressModule {}
