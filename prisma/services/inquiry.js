import api from '@/lib/common/api';
import prisma from '@/prisma/index';

export const createInquiry = async (captcha, name, email, subject, message) => {
  const { success } = await api(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      },
      method: 'POST',
    }
  );

  if (success) {
    await prisma.inquiry.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });
  }

  return success;
};

export const getInquiries = async () =>
  await prisma.inquiry.findMany({
    orderBy: [{ createdAt: 'desc' }],
    select: {
      name: true,
      email: true,
      subject: true,
      message: true,
      createdAt: true,
    },
    where: {
      deletedAt: null,
    },
  });
