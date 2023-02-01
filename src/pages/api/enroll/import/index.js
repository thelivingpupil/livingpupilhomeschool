import { validateSession } from "@/config/api-validation";
import prisma from "@/prisma/index";

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

    res.status(200).json({ message: 'Successful import', data: {
      session,
      user
    } });
 } catch (error) {
    res.status(400).json({
      error
    })
 }
}

export default handler;
