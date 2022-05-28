import crypto from 'crypto';

import { validateSession } from '@/config/api-validation';
import { createTransaction } from '@/prisma/services/transaction';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    const session = await validateSession(req, res);
    const {
      firstName,
      middleName,
      lastName,
      gender,
      religion,
      reason,
      enrollmentType,
      incomingGradeLevel,
      formerSchoolName,
      formerSchoolAddress,
      program,
      accreditation,
      payment,
      birthDate,
    } = req.body;

    res.status(200).json({ data: {} });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
