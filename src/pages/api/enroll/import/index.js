const handler = async (req, res) => {
 try {

    const session = await validateSession(req, res);

    const user = await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        name: true,
        userCode: true,
        createdWorkspace: true
      },
      where: { email: 'babydaughson@gmail.com' },
    });

    // const activeUser = user || await prisma.user.findUnique({
    //   select: {
    //     id: true,
    //     email: true,
    //     name: true,
    //     userCode: true,
    //     createdWorkspace: true
    //   },
    //   where: { id: session.user.userId },
    // });

    res.status(200).json({ message: 'Successful import', data: {
      session,
      user,
      // activeUser
    } });
 } catch (error) {
    res.status(400).json({
      error
    })
 }
}

export default handler;
