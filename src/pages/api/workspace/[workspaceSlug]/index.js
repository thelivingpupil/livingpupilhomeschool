import { validateSession } from '@/config/api-validation';
import {
  getWorkspace,
  requestWorkspaceDeletion,
} from '@/prisma/services/workspace';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    try {
      const session = await validateSession(req, res);
      const workspace = await getWorkspace(
        session.user.userId,
        session.user.email,
        req.query.workspaceSlug
      );

      if (!workspace) {
        return res
          .status(404)
          .json({ errors: { error: { msg: 'Workspace not found' } } });
      }

      // Transform data similar to getServerSideProps
      if (workspace.studentRecord) {
        if (workspace.studentRecord.birthDate) {
          workspace.studentRecord.birthDate =
            workspace.studentRecord.birthDate instanceof Date
              ? workspace.studentRecord.birthDate.toDateString()
              : workspace.studentRecord.birthDate;
        }
        if (workspace.studentRecord.createdAt) {
          workspace.studentRecord.createdAt =
            workspace.studentRecord.createdAt instanceof Date
              ? workspace.studentRecord.createdAt.toDateString()
              : workspace.studentRecord.createdAt;
        }
      }

      if (workspace.schoolFees && workspace.schoolFees.length > 0) {
        workspace.schoolFees = workspace.schoolFees.map((item) => ({
          ...item,
          transaction: item.transaction
            ? {
                ...item.transaction,
                amount:
                  item.transaction.amount &&
                  typeof item.transaction.amount.toNumber === 'function'
                    ? item.transaction.amount.toNumber()
                    : item.transaction.amount,
              }
            : null,
        }));
      }

      res.status(200).json({ data: { workspace } });
    } catch (error) {
      res.status(500).json({ errors: { error: { msg: error.message } } });
    }
  } else if (method === 'DELETE') {
    const session = await validateSession(req, res);
    const slug = req.query.workspaceSlug;

    // Deletion is disabled. This endpoint only sends a deletion request email to admin.
    requestWorkspaceDeletion(session.user.userId, session.user.email, slug)
      .then(({ requestedAt }) =>
        res.status(200).json({ data: { requested: true, requestedAt } })
      )
      .catch((error) =>
        res.status(404).json({ errors: { error: { msg: error.message } } })
      );
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
