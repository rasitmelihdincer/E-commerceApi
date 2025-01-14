import { SHA1, SHA256, AES, enc, mode, pad } from 'crypto-js';
/**
 * Generates a hash key for Paybull API integration.
 * @param total - Total amount
 * @param installment - Number of installments
 * @param currencyCode - Currency code (e.g., TRY)
 * @param merchantKey - Merchant key provided by Paybull
 * @param invoiceId - Invoice ID
 * @param appSecret - Application secret key
 * @returns Encrypted hash key string
 */
export function generateHashKey(
  total: number | string,
  installment: number | string,
  currencyCode: string,
  merchantKey: string,
  invoiceId: string,
  appSecret: string,
): string {
  // Data concatenation
  const data = `${total}|${installment}|${currencyCode}|${merchantKey}|${invoiceId}`;
  // Generate IV
  const random = Math.floor(100000000 + Math.random() * 900000000).toString();
  const iv = SHA1(random).toString(enc.Hex).substring(0, 16);
  // Generate password hash
  const pass = SHA1(appSecret).toString(enc.Hex);
  // Generate salt
  const random2 = Math.floor(100000000 + Math.random() * 900000000).toString();
  const salt = SHA1(random2).toString(enc.Hex).substring(0, 4);
  // Generate saltPass
  const saltPass = SHA256(pass + salt)
    .toString(enc.Hex)
    .substring(0, 32);
  // Prepare key and IV for encryption
  const key1 = enc.Utf8.parse(saltPass);
  const iv1 = enc.Utf8.parse(iv);
  // Encrypt data
  const encrypted = AES.encrypt(data, key1, {
    iv: iv1,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  });
  // Create final bundle
  let msgEncryptedBundle = `${iv}:${salt}:${encrypted.toString()}`;
  // Replace all '/' characters with '__'
  msgEncryptedBundle = msgEncryptedBundle.replace(/\//g, '__');
  return msgEncryptedBundle;
}

/**
 * Generates a hash key for Paybull refund API.
 * Uses only invoice_id, merchant_key and app_secret for refund operations.
 */
export function generateRefundHashKey(
  amount: number | string,
  invoiceId: string,
  merchantKey: string,
  appSecret: string,
): string {
  const data = `${amount}|${invoiceId}|${merchantKey}`;

  const random = Math.floor(100000000 + Math.random() * 900000000).toString();
  const iv = SHA1(random).toString(enc.Hex).substring(0, 16);

  const password = SHA1(appSecret).toString(enc.Hex);

  const random2 = Math.floor(100000000 + Math.random() * 900000000).toString();
  const salt = SHA1(random2).toString(enc.Hex).substring(0, 4);

  const saltWithPassword = SHA256(password + salt)
    .toString(enc.Hex)
    .substring(0, 32);

  const key = enc.Utf8.parse(saltWithPassword);
  const ivForEncryption = enc.Utf8.parse(iv);

  const encrypted = AES.encrypt(data, key, {
    iv: ivForEncryption,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  });

  const msgEncryptedBundle = `${iv}:${salt}:${encrypted.toString().replace(/\//g, '__')}`;

  return msgEncryptedBundle;
}
