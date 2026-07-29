import { validateSession } from '@/config/api-validation';
import { updateEmailAsAdmin } from '@/prisma/services/user';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    try {
      const session = await validateSession(req, res);

      if (!session || session.user?.userType !== 'ADMIN') {
        return res.status(403).json({
          errors: { error: { msg: 'Forbidden: Admin access required' } },
        });
      }

      const { userId, email } = req.body;

      if (!userId || !email) {
        return res.status(400).json({
          errors: {
            error: { msg: 'User ID and email address are required' },
          },
        });
      }

      if (!EMAIL_PATTERN.test(String(email).trim())) {
        return res.status(400).json({
          errors: { error: { msg: 'Email must be valid' } },
        });
      }

      const user = await updateEmailAsAdmin(
        userId,
        email,
        session.user?.email
      );

      return res.status(200).json({
        data: {
          message: 'Email address updated successfully',
          user,
        },
      });
    } catch (error) {
      console.error('Admin email update error:', error);
      const message = error.message || 'Failed to update email address';
      let statusCode = 500;

      if (message.includes('not found')) {
        statusCode = 404;
      } else if (message.includes('already')) {
        statusCode = 409;
      } else if (message.includes('same as') || message.includes('required')) {
        statusCode = 400;
      } else if (error.code === 'P2002') {
        statusCode = 409;
      }

      return res.status(statusCode).json({
        errors: { error: { msg: message } },
      });
    }
  }

  return res.status(405).json({
    errors: { error: { msg: `${method} method unsupported` } },
  });
};

export default handler;
