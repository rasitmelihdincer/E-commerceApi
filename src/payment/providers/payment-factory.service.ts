import { Injectable } from '@nestjs/common';
import { PaybullProvider } from './paybull/paybull.provider';
import { IPaymentProvider } from './payment-provider.interface';

@Injectable()
export class PaymentFactory {
  constructor(private readonly paybullProvider: PaybullProvider) {}

  getProvider(providerName: string): IPaymentProvider {
    switch (providerName) {
      case 'paybull':
        return this.paybullProvider;

      // case 'iyzico':
      //   return this.iyzicoProvider;

      default:
        return this.paybullProvider;
    }
  }
}
