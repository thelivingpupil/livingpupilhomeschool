import { createHash } from 'crypto';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    const { txnid, refno, status, message, digest } = req.query;
    let result = 'FAIL_DIGEST_MISMATCH';
    // Save these data into the database
    const hash = createHash('sha1')
      .update(
        `${txnid}:${refno}:${status}:${message}:${process.env.PAYMENTS_SECRET_KEY}`
      )
      .digest('hex');

    if (hash === digest) {
      result = 'OK';
    }

    res.status(200).send(`result=${result}`);
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
