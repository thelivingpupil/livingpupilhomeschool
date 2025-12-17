const html = ({ guardianName, studentName }) => {
  const link = `${process.env.APP_URL}/api/auth/signin`;

  return `
<body>
    <p>Hello ${guardianName}!</p>
    <p>Welcome to <strong>Living Pupil Homeschool</strong>!</p>
    <p>An account has been created for you as part of the student enrollment process for <strong>${studentName}</strong>.</p>
    <p>You can now access your student portal at: <a href="${link}">${link}</a></p>
    <p>To sign in, simply use your email address. You'll receive a verification link to access your account.</p>
    <p><strong>What's Next?</strong></p>
    <ul>
        <li>Access your student's records and enrollment information</li>
        <li>Upload required documents</li>
        <li>View and manage school fees</li>
        <li>Stay updated on your child's homeschool journey</li>
    </ul>
    <p>If you have any questions or need assistance, please don't hesitate to reach out by replying to this email.</p>
    <p>We're excited to have you join the Living Pupil Homeschool community!</p>
    <p>Blessings,<br />${process.env.EMAIL_FROM}</p>
</body>
`;
};

const text = ({ guardianName, studentName }) => {
  const link = `${process.env.APP_URL}/api/auth/signin`;

  return `
Hello ${guardianName}!

Welcome to Living Pupil Homeschool!

An account has been created for you as part of the student enrollment process for ${studentName}.

You can now access your student portal at: ${link}

To sign in, simply use your email address. You'll receive a verification link to access your account.

What's Next?
- Access your student's records and enrollment information
- Upload required documents
- View and manage school fees
- Stay updated on your child's homeschool journey

If you have any questions or need assistance, please don't hesitate to reach out by replying to this email.

We're excited to have you join the Living Pupil Homeschool community!

Blessings,
${process.env.EMAIL_FROM}
`;
};

export { html, text };
