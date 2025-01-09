export interface IPaymentProvider {
  getToken?(): Promise<string>;
}
