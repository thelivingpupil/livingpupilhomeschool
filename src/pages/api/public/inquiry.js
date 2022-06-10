import { validateCreateInquiry } from '@/config/api-validation';
import { createInquiry } from '@/prisma/services/inquiry';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    await validateCreateInquiry(req, res);
    const { captcha, name, email, subject, message } = req.body;
    const isSuccessful = await createInquiry(
      captcha,
      name,
      email,
      subject,
      message
    );
    res
      .status(200)
      .json({ data: { isSuccessful, name, email, subject, message } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
