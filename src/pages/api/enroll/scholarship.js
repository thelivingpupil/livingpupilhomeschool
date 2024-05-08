import { validateSession } from '@/config/api-validation';
import sanityClient from '@/lib/server/sanity';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    // await validateSession(req, res);
    const { code } = req.body;

    const scholarship = await sanityClient.fetch(
      `*[_type == 'scholarships' && code == $code][0]{...}`,
      { code }
    );

    if (scholarship) {
        const { code, type, value } = scholarship   ;
      res.status(200).json({ data: { code, type, value } });
    } else {
      res.status(404).json({
        errors: { error: { msg: `Could not find the given scholarship code` + code } },
      });
    }
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
