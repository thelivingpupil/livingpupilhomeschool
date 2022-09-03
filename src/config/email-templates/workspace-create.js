const html = ({ code, name }) => {
  const link = `${process.env.APP_URL}/teams/invite?code=${encodeURI(code)}`;

  return `
<body>
    <p>Hello there!</p>
    <p>You have created a student record for <strong>${name}</strong>.</p>
    <p>This record encapsulates the student's activities with your dedicated invited teachers or family members.</p>
    <p>In case you need any assistance, just hit reply.</p>
    <p>Cheers,<br />${process.env.EMAIL_FROM}</p>
</body>
`;
};

const text = ({ code, name }) => {
  const link = `${process.env.APP_URL}/teams/invite?code=${encodeURI(code)}`;

  return `
Hello there!

You have created a student record for ${name}.
This record encapsulates the student's activities with your dedicated invited teachers or family members.

In case you need any assistance, just hit reply.

Cheers,
${process.env.EMAIL_FROM}
`;
};

export { html, text };
