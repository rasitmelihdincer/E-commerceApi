import { Create3DDto } from '../dto/create-payment.dto';

export interface PayBullRequest extends Create3DDto {
  invoice_id: string;
  invoice_description: string;
  name: string;
  surname: string;
  total: number;
  return_url: string;
  cancel_url: string;
  items: string;
  hash_key: string;
}

export interface IPaymentProvider {
  getToken(): Promise<string>;
  create3DForm(data: PayBullRequest): Promise<any>;
  checkPaymentStatus(invoiceId: string): Promise<any>;
  getMerchantKey(): string;
  getAppSecret(): string;
}
