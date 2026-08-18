import {
  html as policiesHtml,
  text as policiesText,
} from '@/config/email-templates/policies';
import { sendMail } from '@/lib/server/mail';
import { buildSignedHomeschoolAgreementPdf } from '@/lib/server/homeschool-agreement-pdf';
import { buildSignedParentPartnershipPdf } from '@/lib/server/parent-partnership-pdf';
import { UNSIGNED_AGREEMENT_ATTACHMENTS } from '@/lib/server/stamp-agreement-pdf';

const POLICIES_SUBJECT =
  '[Living Pupil Homeschool] Signed General Policies on Payment of Tuition Fees, Refund and Withdrawal or Transfer Policy';

export const sendSignedEnrollmentAgreements = async ({
  to,
  parentName,
  signatureUrl,
  partnershipSignatureUrl,
  signerName,
  signedAt,
  allowUnsignedFallback = true,
}) => {
  let attachments = UNSIGNED_AGREEMENT_ATTACHMENTS;

  try {
    const [homeschoolPdf, partnershipPdf] = await Promise.all([
      buildSignedHomeschoolAgreementPdf({
        signatureUrl,
        signerName,
        signedAt,
      }),
      buildSignedParentPartnershipPdf({
        signatureUrl: partnershipSignatureUrl,
        signerName,
        signedAt,
      }),
    ]);

    attachments = [
      {
        filename: 'Signed Homeschool Agreement.pdf',
        content: homeschoolPdf,
        contentType: 'application/pdf',
      },
      {
        filename: 'Signed Parent Partnership Agreement.pdf',
        content: partnershipPdf,
        contentType: 'application/pdf',
      },
    ];
  } catch (error) {
    console.error('Signed agreement PDF generation failed:', error);
    if (!allowUnsignedFallback) {
      throw error;
    }
  }

  await sendMail({
    html: policiesHtml({ parentName }),
    subject: POLICIES_SUBJECT,
    text: policiesText({ parentName }),
    to: Array.isArray(to) ? to : [to],
    attachments,
  });
};
