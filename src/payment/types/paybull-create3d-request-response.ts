export interface PayBullCreate3DRequest {
  cc_holder_name: string;
  cc_no: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  currency_code: string;
  installments_number: number;
  invoice_id: string;
  invoice_description: string;
  name: string;
  surname: string;
  total: string;
  merchant_key: string;
  cancel_url: string;
  return_url: string;
  hash_key: string;
  items: string;
}
