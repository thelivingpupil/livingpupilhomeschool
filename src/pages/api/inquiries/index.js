import { validateSession } from '@/config/api-validation';
import { getInquiries } from '@/prisma/services/inquiry';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const inquiries = await getInquiries();
    res.status(200).json({ data: { inquiries } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
