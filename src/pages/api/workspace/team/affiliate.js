import { invite } from '@/prisma/services/user';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    const { email, inviteCode } = req.body;
    invite(email, inviteCode)
      .then(() => res.status(200).json({ data: { email } }))
      .catch((error) =>
        res.status(400).json({ errors: { error: { msg: error.message } } })
      );
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
