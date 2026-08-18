import { validateSession } from '@/config/api-validation';
import { sendSignedEnrollmentAgreements } from '@/lib/server/signed-enrollment-agreements';
import prisma from '@/prisma/index';

const getParentName = (str) => {
  const trimmed = (str || '').trim();
  if (trimmed === '') return '';
  const words = trimmed.split(/\s+/);
  const lastWord = words[words.length - 1];
  return lastWord.replace(/[.,?!;:]$/, '');
};

const handler = async (req, res) => {
  const { method } = req;

  if (method !== 'POST') {
    return res.status(405).json({
      errors: { error: { msg: `${method} method unsupported` } },
    });
  }

  try {
    const session = await validateSession(req, res);

    if (!session || session.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        errors: { error: { msg: 'Forbidden: Admin access required' } },
      });
    }

    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({
        errors: { error: { msg: 'Student ID is required' } },
      });
    }

    const studentRecord = await prisma.studentRecord.findUnique({
      where: { studentId },
      select: {
        firstName: true,
        signature: true,
        enrollmentAgreementSignature: true,
        enrollmentAgreementSignatureDate: true,
        student: {
          select: {
            creator: {
              select: {
                email: true,
                guardianInformation: {
                  select: {
                    primaryGuardianName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!studentRecord) {
      return res.status(404).json({
        errors: { error: { msg: 'Student record not found' } },
      });
    }

    const parentEmail = studentRecord.student?.creator?.email;
    const signerName =
      studentRecord.student?.creator?.guardianInformation?.primaryGuardianName ||
      '';

    if (!parentEmail) {
      return res.status(400).json({
        errors: { error: { msg: 'Parent email is missing for this student' } },
      });
    }

    if (
      !studentRecord.signature ||
      !studentRecord.enrollmentAgreementSignature
    ) {
      return res.status(400).json({
        errors: {
          error: {
            msg: 'Signed agreements are not available for this student',
          },
        },
      });
    }

    await sendSignedEnrollmentAgreements({
      to: [parentEmail],
      parentName: getParentName(signerName),
      signatureUrl: studentRecord.signature,
      partnershipSignatureUrl: studentRecord.enrollmentAgreementSignature,
      signerName,
      signedAt: studentRecord.enrollmentAgreementSignatureDate,
      allowUnsignedFallback: false,
    });

    return res.status(200).json({
      data: { message: 'Signed agreements sent successfully' },
    });
  } catch (error) {
    console.error('Resend signed agreements error:', error);
    return res.status(500).json({
      errors: {
        error: { msg: error.message || 'Failed to resend signed agreements' },
      },
    });
  }
};

export default handler;
