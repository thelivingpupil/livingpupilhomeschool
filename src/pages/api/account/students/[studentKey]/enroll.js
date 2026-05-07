import { validateSession } from '@/config/api-validation';
import { completeParentYearEnrollment } from '@/prisma/services/parent-students';

const ERROR_RESPONSE = {
  NOT_FOUND: { status: 404, msg: 'Student not found or you do not have access.' },
  NO_STUDENT_RECORD: {
    status: 400,
    msg: 'Complete the student profile before enrolling in a school year.',
  },
  V2_NOT_READY: {
    status: 503,
    msg: 'Student record is still syncing. Try again in a moment.',
  },
  INVALID_SCHOOL_YEAR: {
    status: 400,
    msg: 'Selected school year is not available.',
  },
  ALREADY_ENROLLED: {
    status: 409,
    msg: 'This student is already enrolled for that school year.',
  },
  FEE_CREATE_FAILED: {
    status: 422,
    msg: 'Could not create school fees. Check program, grade, and payment selections.',
  },
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `${req.method} method unsupported` });
  }

  const { studentKey } = req.query;
  if (!studentKey || typeof studentKey !== 'string') {
    return res.status(400).json({ error: 'Missing studentKey' });
  }

  try {
    const session = await validateSession(req, res);
    if (res.headersSent) return;

    const body = req.body || {};
    if (!body.schoolYear || !body.gradeLevel || !body.payment || !body.paymentMethod) {
      return res.status(400).json({
        error: 'Missing required fields (school year, grade, payment, payment method).',
      });
    }
    if (body.policyAgreement !== true) {
      return res.status(400).json({ error: 'You must agree to save your responses.' });
    }
    if (!body.signatureLink || String(body.signatureLink).trim().length < 10) {
      return res.status(400).json({ error: 'Signature is required.' });
    }

    const result = await completeParentYearEnrollment(
      session.user.userId,
      session.user.email,
      studentKey,
      body
    );

    if (result.error) {
      const err = ERROR_RESPONSE[result.error] || {
        status: 400,
        msg: result.message || 'Unable to complete enrollment.',
      };
      return res.status(err.status).json({
        error: err.msg,
        detail: result.message,
      });
    }

    return res.status(201).json({ data: result });
  } catch (e) {
    throw e;
  }
};

export default handler;
