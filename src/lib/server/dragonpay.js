export const CURRENCY_CODES = {
  PHP: 'Philippine Peso',
  USD: 'US Dollar',
  CAD: 'Canadian Dollar',
};

export const ERROR_CODES = {
  '000': 'Success',
  101: 'Invalid payment gateway id',
  102: 'Incorrect secret key',
  103: 'Invalid reference number',
  104: 'Unauthorized access',
  105: 'Invalid token',
  106: 'Currency not supported',
  107: 'Transaction cancelled',
  108: 'Insufficient funds',
  109: 'Transaction limit exceeded',
  110: 'Error in operation',
  111: 'Security Error',
  112: 'Invalid parameters',
  201: 'Invalid Merchant Id',
  202: 'Invalid Merchant Password',
};

export const STATUS_CODES = {
  S: 'Success',
  F: 'Failure',
  P: 'Pending',
  U: 'Unknown',
  R: 'Refund',
  K: 'Chargeback',
  V: 'Void',
  A: 'Authorized',
};

export const getBasicAuthorization = () => {
  const token = Buffer.from(
    `${process.env.PAYMENTS_MERCHANT_ID}:${process.env.PAYMENTS_SECRET_KEY}`
  ).toString('base64');
  return `Basic ${token}`;
};
