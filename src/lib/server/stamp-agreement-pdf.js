export const HOMESCHOOL_AGREEMENT_URL =
  'https://livingpupilhomeschool.com/files/Homeschool_Agreement.pdf';

export const UNSIGNED_AGREEMENT_ATTACHMENTS = [
  {
    filename: 'Payment Policies.pdf',
    path: 'https://livingpupilhomeschool.com/files/Payment_Policies.pdf',
  },
  {
    filename:
      'General Policies on Payment of Tuition Fees, Refund and Withdrawal or Transfer Policy.pdf',
    path: HOMESCHOOL_AGREEMENT_URL,
  },
];

export const fetchBytes = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
};
