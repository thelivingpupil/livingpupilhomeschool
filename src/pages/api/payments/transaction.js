const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    const session = await validateSession(req, res);
    const {} = req.body;
    const paymentLink = await createPaymentLink(session.user.email);
    res.status(200).json({ data: { paymentLink } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
