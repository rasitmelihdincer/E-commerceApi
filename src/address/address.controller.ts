import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateAddressDto } from './dto/create-address.dto';
import { I18nService } from 'nestjs-i18n';
import { SessionType } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('address')
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  async list(@Req() req) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException('Only customers can access addresses');
    }
    return await this.addressService.list(req.session.customerId);
  }

  @Post()
  async create(@Req() req, @Body() dto: CreateAddressDto) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException('Only customers can access addresses');
    }
    const address = await this.addressService.create(
      req.session.customerId,
      dto,
    );
    const message = await this.i18n.translate('test.ADDRESS_CREATED');
    return {
      messeage: message,
      address,
    };
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException('Only customers can access addresses');
    }
    const address = await this.addressService.update(
      +id,
      req.session.customerId,
      dto,
    );
    const message = await this.i18n.translate('test.ADDRESS_UPDATED');
    return { message: message, address };
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException('Only customers can access addresses');
    }
    await this.addressService.delete(+id, req.session.customerId);
    const message = await this.i18n.translate('test.ADDRESS_DELETED');
    return { message: message };
  }
}
