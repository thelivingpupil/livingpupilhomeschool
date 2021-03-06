import { createHash } from 'crypto';

import { updateTransaction } from '@/prisma/services/transaction';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    const { txnid, refno, status, message, digest } = req.body;
    let result = 'FAIL_DIGEST_MISMATCH';
    const hash = createHash('sha1')
      .update(
        `${txnid}:${refno}:${status}:${message}:${process.env.PAYMENTS_SECRET_KEY}`
      )
      .digest('hex');

    if (hash === digest) {
      result = 'OK';
      await updateTransaction(txnid, refno, status, message);
    }

    res.status(200).send(`result=${result}`);
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
