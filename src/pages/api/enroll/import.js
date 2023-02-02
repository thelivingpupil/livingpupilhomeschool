import { validateSession } from "@/config/api-validation";
import prisma from "@/prisma/index";

const handler = async (req, res) => {
 try {
    const firstName = 'KHLOE COLLEEN';
    const email = 'babydaughson@gmail.com'
    const processUser = async ({email, firstName }) => {
      const session = await validateSession(req, res);

      const user = await prisma.user.findUnique({
        select: {
          id: true,
          email: true,
          name: true,
          userCode: true,
          createdWorkspace: true
        },
        where: { email },
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

      return {
        session,
        user,
        activeUser,
        existingWorkspace,
        workspace
      }
    }

    const data = await processUser({email, firstName});

    res.status(200).json({ message: 'Successful import', data });
 } catch (error) {
    res.status(400).json({
      error
    })
 }
}

export default handler;
