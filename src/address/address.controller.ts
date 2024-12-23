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
} from '@nestjs/common';
import { AddressService } from './address.service';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateAddressDto } from './dto/create-address.dto';
import { I18nService } from 'nestjs-i18n';
@UseGuards(AuthGuard)
@Controller('address')
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  async list(@Req() req) {
    return await this.addressService.list(req.user.id);
  }

  @Post()
  async create(@Req() req, @Body() dto: CreateAddressDto) {
    const address = await this.addressService.create(req.user.id, dto);
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
    const address = await this.addressService.update(+id, req.user.id, dto);
    const message = await this.i18n.translate('test.ADDRESS_UPDATED');
    return { message: message, address };
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    await this.addressService.delete(+id, req.user.id);
    const message = await this.i18n.translate('test.ADDRESS_DELETED');
    return { message: message };
  }
}
