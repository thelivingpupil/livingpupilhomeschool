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

  console.log('I am here');

  console.log(user);

  console.log(session);
}

export default handler;
