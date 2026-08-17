import { validateSession } from '@/config/api-validation';
import { deleteEmptyWorkspace } from '@/prisma/services/workspace';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'DELETE') {
    try {
      const session = await validateSession(req, res);
      const slug = req.query.workspaceSlug;
      await deleteEmptyWorkspace(
        session.user.userId,
        session.user.email,
        slug
      );
      res.status(200).json({ data: { deleted: true } });
    } catch (error) {
      const status = error.message === 'Unable to find workspace' ? 404 : 400;
      res.status(status).json({ errors: { error: { msg: error.message } } });
    }
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
