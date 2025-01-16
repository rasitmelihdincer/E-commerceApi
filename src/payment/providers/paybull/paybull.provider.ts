import { ConfigService } from '@nestjs/config';
import {
  IPaymentProvider,
  PayBullRequest,
} from '../payment-provider.interface';
import axios from 'axios';
import {
  HttpStatus,
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { generateRefundHashKey } from 'src/common/utils/hash-key-generate';

@Injectable()
export class PaybullProvider implements IPaymentProvider {
  private readonly logger = new Logger(PaybullProvider.name);
  private readonly baseUrl: string;
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly merchantKey: string;
  private token: string;

  private readonly paySmart3DEndpoint =
    'https://test.paybull.com/ccpayment/api/paySmart3D';

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('PAYBULL_API_URL');
    this.appId = this.configService.get<string>('PAYBULL_APP_ID');
    this.appSecret = this.configService.get<string>('PAYBULL_APP_SECRET');
    this.merchantKey = this.configService.get<string>('PAYBULL_MERCHANT_KEY');

    if (!this.baseUrl || !this.appId || !this.appSecret || !this.merchantKey) {
      throw new Error(
        'PayBull configuration is missing. Please check your environment variables.',
      );
    }

    this.logger.debug(`PayBull Config:
      baseUrl: ${this.baseUrl}
      appId: ${this.appId}
      appSecret: ${this.appSecret}
      merchantKey: ${this.merchantKey}
    `);
  }

  /**
   * Örnek: Provider içinde merchant key, secret vb.
   *        ihtiyaç duyulan diğer metotları da açabilirsiniz.
   */
  getMerchantKey(): string {
    return this.merchantKey;
  }

  getAppSecret(): string {
    return this.appSecret;
  }

  getAppId(): string {
    return this.appId;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Paybull Token alma
   * Tekrar tekrar token çağırmamak için basit bir cache (this.token) kullanıyoruz.
   */
  async getToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }

    const url = `${this.baseUrl}/api/token`;
    const requestBody = {
      app_id: this.appId,
      app_secret: this.appSecret,
    };

    this.logger.debug(`Requesting token from PayBull => URL: ${url}`);
    this.logger.debug(`Request body: ${JSON.stringify(requestBody)}`);

    try {
      const response = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.logger.debug(
        `PayBull token response: ${JSON.stringify(response.data)}`,
      );

      const token = response.data?.data?.token || response.data?.token;
      if (!token) {
        throw new Error(
          `PayBull invalid token response => ${JSON.stringify(response.data)}`,
        );
      }

      this.token = token;
      return token;
    } catch (error) {
      const errData = error?.response?.data || error.message;
      this.logger.error(`PayBull getToken Error => ${JSON.stringify(errData)}`);
      throw new HttpException(
        `PayBull token error: ${JSON.stringify(errData)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * create3DForm
   * Bu metot, PaymentService içindeki create3DSecurePayment sürecinde çağrılır.
   */
  async create3DForm(data: PayBullRequest): Promise<any> {
    this.logger.debug(`Creating 3D payment with data: ${JSON.stringify(data)}`);

    try {
      const token = await this.getToken();

      // create3DForm çağrılmadan önce hash_key oluşturulabilir.
      // (Örnek: PayBull dokümantasyonuna göre bazen merchant side’da hash hazırlamak gerekir)
      // Aşağıdaki gibi generateHashKey fonksiyonunu da entegre edebilirsiniz:
      //
      // const hash_key = generateHashKey(
      //   data.total.toFixed(2),
      //   data.installments_number?.toString() || '1',
      //   data.currency_code,
      //   this.getMerchantKey(),
      //   data.invoice_id,
      //   this.getAppSecret(),
      // );
      //
      // data.hash_key = hash_key;
      //
      // Fakat bu örnekte PaymentService içerisinde de oluşturabilirsiniz.

      const parameters = {
        cc_holder_name: data.cc_holder_name,
        cc_no: data.cc_no,
        expiry_month: data.expiry_month,
        expiry_year: data.expiry_year,
        cvv: data.cvv,
        currency_code: data.currency_code,
        installments_number: data.installments_number,
        invoice_id: data.invoice_id,
        invoice_description: data.invoice_description,
        name: data.name,
        surname: data.surname,
        total: data.total.toFixed(2),
        merchant_key: this.merchantKey,
        cancel_url: data.cancel_url,
        return_url: data.return_url,
        hash_key: data.hash_key,
        items: data.items,
      };

      const response = await axios.post(
        this.paySmart3DEndpoint,
        JSON.stringify(parameters),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          },
        },
      );

      this.logger.debug(
        `PayBull 3D response: ${JSON.stringify(response.data)}`,
      );

      if (response.status !== 200) {
        return {
          success: false,
          http_code: response.status,
          error: response.data,
        };
      }

      return response.data;
    } catch (error) {
      const errData = error?.response?.data || error.message;
      this.logger.error(
        `PayBull 3D payment Error => ${JSON.stringify(errData)}`,
      );

      return {
        success: false,
        http_code: error?.response?.status || 500,
        error: errData,
      };
    }
  }

  /**
   * checkPaymentStatus
   * Ödeme sonuç sorgulamak için PaymentService -> handlePaymentResult akışında çağrılır.
   */
  async checkPaymentStatus(invoiceId: string): Promise<any> {
    const token = await this.getToken();

    const data = {
      invoice_id: invoiceId,
      merchant_key: this.getMerchantKey(),
      include_pending_status: 1,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/checkstatus`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error checking payment status for invoice ${invoiceId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * refund
   * Tam iadeyi yönetir. PaymentService -> refundPayment akışında çağrılır.
   */
  async refund(amount: number, orderId: number): Promise<any> {
    const invoice_id = `ORDER_${orderId}`;

    // Hash key oluştur
    const hash_key = generateRefundHashKey(
      amount,
      invoice_id,
      this.merchantKey,
      this.appSecret,
    );

    try {
      const token = await this.getToken();

      const parameters = {
        amount: '',
        invoice_id,
        hash_key,
        app_id: this.appId,
        app_secret: this.appSecret,
        merchant_key: this.merchantKey,
      };

      this.logger.debug(
        `PayBull refund request parameters: ${JSON.stringify(parameters)}`,
      );

      const response = await axios.post(
        `${this.baseUrl}/api/refund`,
        parameters,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      this.logger.debug(
        `PayBull refund response: ${JSON.stringify(response.data)}`,
      );

      if (response.data.status_code === 100) {
        return response.data;
      }

      throw new BadRequestException(
        response.data.error_message || response.data.error || 'Refund failed',
      );
    } catch (error) {
      const errData = error?.response?.data || error.message;
      this.logger.error(`PayBull refund Error => ${JSON.stringify(errData)}`);
      throw new BadRequestException(
        errData?.error_message || errData?.error || errData || 'Refund failed',
      );
    }
  }
}
