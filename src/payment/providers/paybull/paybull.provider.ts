import { ConfigService } from '@nestjs/config';
import { IPaymentProvider } from '../payment-provider.interface';
import axios from 'axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Create3DDto } from '../../dto/create-payment.dto';
import * as querystring from 'querystring';

@Injectable()
export class PaybullProvider implements IPaymentProvider {
  private readonly logger = new Logger(PaybullProvider.name);
  private baseUrl: string;
  private appId: string;
  private appSecret: string;
  private merchantKey: string;
  private token: string;

  private readonly paySmart3DEndpoint =
    'https://test.paybull.com/ccpayment/api/paySmart3D';

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('PAYBULL_BASE_URL');
    this.appId = this.configService.get<string>('PAYBULL_APP_KEY');
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

  getMerchantKey(): string {
    return this.merchantKey;
  }

  getAppSecret(): string {
    return this.appSecret;
  }

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

  async create3DForm(dto: Create3DDto): Promise<any> {
    this.logger.debug(`Creating 3D payment with data: ${JSON.stringify(dto)}`);

    try {
      const token = await this.getToken();

      const formData = {
        cc_holder_name: dto.cc_holder_name,
        cc_no: dto.cc_no,
        expiry_month: dto.expiry_month,
        expiry_year: dto.expiry_year,
        cvv: dto.cvv,
        currency_code: dto.currency_code,
        installments_number: dto.installments_number,
        invoice_id: dto.invoice_id,
        invoice_description: dto.invoice_description,
        name: dto.name,
        surname: dto.surname,
        total: dto.total.toFixed(2),
        merchant_key: this.merchantKey,
        cancel_url: dto.cancel_url,
        return_url: dto.return_url,
        hash_key: dto.hash_key,
        items: dto.items,
      };

      const response = await axios.post(
        this.paySmart3DEndpoint,
        querystring.stringify(formData),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      this.logger.debug(
        `PayBull 3D response: ${JSON.stringify(response.data)}`,
      );

      if (response.status !== 200) {
        return {
          success: false,
          error: response.data,
          errorCode: response.status,
        };
      }

      return {
        success: true,
        htmlBody: response.data,
      };
    } catch (error) {
      const errData = error?.response?.data || error.message;
      this.logger.error(
        `PayBull 3D payment Error => ${JSON.stringify(errData)}`,
      );

      return {
        success: false,
        error: errData,
        errorCode: error?.response?.status || 500,
      };
    }
  }
}
