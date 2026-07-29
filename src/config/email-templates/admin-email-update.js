const html = ({ email, previousEmail, name }) => {
  return `
<body>
    <p>Hello ${name || 'there'}!</p>
    <p>The Living Pupil Homeschool team has updated the email address of your account from <strong>${previousEmail || 'a previous address'}</strong> to <strong>${email}</strong>.</p>
    <p>From now on, please sign in using <strong>${email}</strong>. You will be asked to verify this address the next time you log in.</p>
    <p>If you did not request this change, please reply to this email right away.</p>
    <p>Cheers,<br />${process.env.EMAIL_FROM}</p>
</body>
`;
};

const text = ({ email, previousEmail, name }) => {
  return `
Hello ${name || 'there'}!

The Living Pupil Homeschool team has updated the email address of your account from ${previousEmail || 'a previous address'} to ${email}.

From now on, please sign in using ${email}. You will be asked to verify this address the next time you log in.

If you did not request this change, please reply to this email right away.

Cheers,
${process.env.EMAIL_FROM}
`;
};

export { html, text };
