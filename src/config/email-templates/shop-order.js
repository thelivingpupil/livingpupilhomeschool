import {
  ACCREDITATION,
  ENROLLMENT_TYPE,
  GRADE_LEVEL,
  PAYMENT_METHOD,
  PAYMENT_TYPE,
  PROGRAM,
} from '@/utils/constants';

const html = ({
  accreditation,
  birthCertificateLink,
  enrollmentType,
  firstName,
  incomingGradeLevel,
  payment,
  paymentMethod,
  pictureLink,
  program,
  reportCardLink,
  schoolFee,
}) => {
  return `
<body>
    <p>Thank you for choosing <strong>Living Pupil Homeschool</strong>.</p>
    <p>We are glad to inform you that we have received <strong>${firstName}'s</strong> records and will be processed for enrollment.</p>
    <p>For confirmation, below are the details you have submitted.</p>
    <h2>Enrollment Details</h2>
    <ol>
      <li>Incoming Grade Level: ${GRADE_LEVEL[incomingGradeLevel]}</li>
      <li>Enrollment Type: ${ENROLLMENT_TYPE[enrollmentType]}</li>
      <li>Program: ${PROGRAM[program]}</li>
      <li>Accreditation: ${ACCREDITATION[accreditation]}</li>
    </ol>
    <h2>Submitted Documents</h2>
    <ul>
      ${pictureLink ? '<li>Picture</li>' : ''}
      ${birthCertificateLink ? '<li>Birth Certificate</li>' : ''}
      ${reportCardLink ? '<li>Report Card</li>' : ''}
    </ul>
    <h2>Payment Details</h2>
    <ol>
      <li>Payment Method: ${PAYMENT_METHOD[paymentMethod]}</li>
      <li>Payment Type: ${PAYMENT_TYPE[payment]}</li>
    </ol>
    <p>You can access the payment URL here if you have not yet paid the school fees.</p>
    <p><a href="${
      schoolFee.url
    }" target="_blank"><strong>Payment URL</strong></a></p>
    <p>In case you need any assistance and found any discrepancies, just hit reply.</p>
    <p>Cheers,<br />${process.env.EMAIL_FROM}</p>
</body>
`;
};

const text = ({
  accreditation,
  birthCertificateLink,
  enrollmentType,
  firstName,
  incomingGradeLevel,
  payment,
  paymentMethod,
  pictureLink,
  program,
  reportCardLink,
  schoolFee,
}) => {
  return `
Thank you for choosing Living Pupil Homeschool.
We are glad to inform you that we have received ${firstName}'s records and will be processed for enrollment.

For confirmation, below are the details you have submitted.

Enrollment Details
1. Incoming Grade Level: ${GRADE_LEVEL[incomingGradeLevel]}
2. Enrollment Type: ${ENROLLMENT_TYPE[enrollmentType]}
3. Program: ${PROGRAM[program]}
4. Accreditation: ${ACCREDITATION[accreditation]}

Submitted Documents
${pictureLink ? '* Picture\n' : ''}
${birthCertificateLink ? '* Birth Certificate\n' : ''}
${reportCardLink ? '* Report Card' : ''}

Payment Details
1. Payment Method: ${PAYMENT_METHOD[paymentMethod]}
2. Payment Type: ${PAYMENT_TYPE[payment]}

You can access the payment URL here if you have not yet paid the school fees.
Payment URL: ${schoolFee.url}

In case you need any assistance and found any discrepancies, just hit reply.

Cheers,
${process.env.EMAIL_FROM}
`;
};

export { html, text };
