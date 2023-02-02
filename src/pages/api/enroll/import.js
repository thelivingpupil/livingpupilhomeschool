import { validateSession } from "@/config/api-validation";
import prisma from "@/prisma/index";

const handler = async (req, res) => {
 try {
    const firstName = 'KHLOE COLLEEN';
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

    const activeUser = user ?? await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        name: true,
        userCode: true,
        createdWorkspace: true
      },
      where: { id: session.user.userId },
    });

    const existingWorkspace = activeUser.createdWorkspace.find((workspace) => {
      const validation = workspace.name.length > firstName.length ? {
        compareWith: workspace.name.toLowerCase(),
        compareTo: firstName.toLowerCase()
      } : {
        compareWith: firstName.toLowerCase(),
        compareTo: workspace.name.toLowerCase()
      }

      return validation.compareWith.includes(validation.compareTo)
    })

    const workspace = existingWorkspace ?? 'test';

    res.status(200).json({ message: 'Successful import', data: {
      session,
      user,
      activeUser,
      existingWorkspace,
      workspace
    } });
 } catch (error) {
    res.status(400).json({
      error
    })
 }
}

export default handler;
