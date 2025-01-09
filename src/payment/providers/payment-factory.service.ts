// src/payment/providers/payment-factory.service.ts
import { Injectable } from '@nestjs/common';
import { PaybullProvider } from './paybull/paybull.provider';
import { IPaymentProvider } from './payment-provider.interface';

@Injectable()
export class PaymentFactoryService {
  constructor(private paybullProvider: PaybullProvider) {}

  getProvider(providerName: string): IPaymentProvider {
    switch (providerName) {
      case 'paybull':
        return this.paybullProvider;
      default:
        throw new Error(`Provider not found: ${providerName}`);
    }
  }
}
