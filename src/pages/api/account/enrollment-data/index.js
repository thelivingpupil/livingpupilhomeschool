import { validateSession } from '@/config/api-validation';
import sanityClient from '@/lib/server/sanity';
import { getGuardianInformation } from '@/prisma/services/user';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `${req.method} method unsupported` });
  }

  try {
    const session = await validateSession(req, res);
    if (res.headersSent) return;

    const [guardian, schoolFees, programs] = await Promise.all([
      getGuardianInformation(session.user.userId),
      sanityClient.fetch(`*[_type == 'schoolFees']{...}`),
      sanityClient.fetch(`*[_type == 'programs']`),
    ]);

    return res.status(200).json({
      data: { guardian, schoolFees, programs },
    });
  } catch (e) {
    throw e;
  }
};

export default handler;
