import { validateSession } from '@/config/api-validation';
import sanityClient from '@/lib/server/sanity';
import { countUsedDiscountCode } from '@/prisma/services/student-record';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    await validateSession(req, res);
    const { code } = req.body;
    const discount = await sanityClient.fetch(
      `*[_type == 'discounts' && code == $code][0]{...}`,
      { code }
    );

    if (discount) {
      const { code, count, type, value } = discount;
      const used = await countUsedDiscountCode(code);

      if (used < count) {
        res.status(200).json({ data: { code, type, value } });
      } else {
        res.status(405).json({
          errors: {
            error: { msg: `All ${code} discount codes are already used` },
          },
        });
      }
    } else {
      res.status(404).json({
        errors: { error: { msg: `Could not find the given discount code` } },
      });
    }
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
