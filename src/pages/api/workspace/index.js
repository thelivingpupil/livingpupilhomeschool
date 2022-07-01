import slugify from 'slugify';

import {
  validateCreateWorkspace,
  validateSession,
} from '@/config/api-validation/index';
import {
  createWorkspace,
  getSingleWorkspace,
} from '@/prisma/services/workspace';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    const session = await validateSession(req, res);
    await validateCreateWorkspace(req, res);
    const { name } = req.body;
    let slug = slugify(name.toLowerCase());
    await createWorkspace(session.user.userId, session.user.email, name, slug);
    const workspace = await getSingleWorkspace(
      session.user.userId,
      session.user.email,
      slug
    );
    res.status(200).json({ data: { name, slug, workspace } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
