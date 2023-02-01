import { validateSession } from "@/config/api-validation";
import prisma from "@/prisma/index";

const handler = async (req, res) => {
 const session = await validateSession(req, res);

 const user = await prisma.user.findUnique({
    select: {
      id: true,
      email: true,
      name: true,
      userCode: true,
    },
    where: { email: 'babydaughson@gmail.com' },
  });

  // console.log('I am here');

  // console.log(JSON.stringify(user));

  // console.log(JSON.stringify());

  res.status(200).json({
    user,
    session
  });
}

export default handler;
