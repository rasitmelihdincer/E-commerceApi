import { Injectable, Logger } from '@nestjs/common';
import { PaybullProvider } from './providers/paybull/paybull.provider';
import { Create3DDto } from './dto/create-payment.dto';
import { generateHashKey } from 'src/common/utils/hash-key-generate';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly paybullProvider: PaybullProvider) {}

  async getPaybullToken(): Promise<string> {
    return this.paybullProvider.getToken();
  }

  async create3DSecurePayment(dto: Create3DDto): Promise<any> {
    // Hash Key oluştur
    const hashKey = generateHashKey(
      dto.total.toFixed(2),
      dto.installments_number.toString(),
      dto.currency_code,
      this.paybullProvider.getMerchantKey(),
      dto.invoice_id,
      this.paybullProvider.getAppSecret(),
    );

    this.logger.debug(
      `Generated hash key for invoice ${dto.invoice_id}: ${hashKey}`,
    );
    this.logger.debug(`Payment data: ${JSON.stringify(dto)}`);

    dto.hash_key = hashKey;

    return await this.paybullProvider.create3DForm(dto);
  }
}
