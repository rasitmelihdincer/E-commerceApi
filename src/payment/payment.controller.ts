import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Create3DDto } from './dto/create-payment.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('3d')
  async create3DPayment(@Body() dto: Create3DDto) {
    return await this.paymentService.create3DSecurePayment(dto);
  }

  @Post('token')
  async getPaybullToken() {
    return await this.paymentService.getPaybullToken();
  }
}
