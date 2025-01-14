import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Create3DDto } from './dto/create-payment.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('3d')
  @ApiOperation({ summary: '3D Secure ödeme başlat' })
  async create3DPayment(@Body() dto: Create3DDto) {
    return await this.paymentService.create3DSecurePayment(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm ödemeleri listele' })
  @ApiResponse({ status: 200, description: 'Ödemeler başarıyla listelendi' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.paymentService.findAll(paginationDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Ödeme istatistiklerini getir' })
  @ApiResponse({
    status: 200,
    description: 'İstatistikler başarıyla getirildi',
  })
  async getStatistics() {
    return await this.paymentService.getPaymentStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ödeme detaylarını getir' })
  @ApiResponse({
    status: 200,
    description: 'Ödeme detayları başarıyla getirildi',
  })
  @ApiResponse({ status: 404, description: 'Ödeme bulunamadı' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.paymentService.findOne(id);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Siparişe ait ödemeleri getir' })
  @ApiResponse({ status: 200, description: 'Ödemeler başarıyla getirildi' })
  async findByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    return await this.paymentService.findByOrderId(orderId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Müşteriye ait ödemeleri getir' })
  @ApiResponse({ status: 200, description: 'Ödemeler başarıyla getirildi' })
  async findByCustomerId(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.paymentService.findByCustomerId(
      customerId,
      paginationDto,
    );
  }

  @Get('token')
  @ApiOperation({ summary: 'PayBull token al' })
  async getPaybullToken() {
    return await this.paymentService.getPaybullToken();
  }

  @Get('result/success')
  @ApiOperation({ summary: 'Başarılı ödeme sonucu' })
  async handlePaymentSuccess(@Query() queryParams: any) {
    this.logger.debug(
      `Payment success callback: ${JSON.stringify(queryParams)}`,
    );
    return await this.paymentService.handlePaymentResult(queryParams, true);
  }

  @Get('result/cancel')
  @ApiOperation({ summary: 'İptal edilen ödeme sonucu' })
  async handlePaymentCancel(@Query() queryParams: any) {
    this.logger.debug(
      `Payment cancel callback: ${JSON.stringify(queryParams)}`,
    );
    return await this.paymentService.handlePaymentResult(queryParams, false);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Ödeme iadesi yap' })
  @ApiResponse({ status: 200, description: 'İade başarıyla yapıldı' })
  @ApiResponse({ status: 400, description: 'İade yapılamadı' })
  @ApiResponse({ status: 404, description: 'Ödeme bulunamadı' })
  async refundPayment(@Param('id', ParseIntPipe) id: number) {
    return await this.paymentService.refundPayment(id);
  }
}
