import { validateSession } from "@/config/api-validation";
import prisma from "@/prisma/index";

export const processUser = async ({email, firstName}) => {
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
      where: { email },
    });

    const activeUser = user || await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        name: true,
        userCode: true,
        createdWorkspace: true
      },
      where: { id: session.user.userId },
    });

    // const existingWorkspace = activeUser.createdWorkspace.find((workspace) => {
    //   const validation = workspace.name.length > firstName.length ? {
    //     compareWith: workspace.name.toLowerCase(),
    //     compareTo: firstName.toLowerCase()
    //   } : {
    //     compareWith: firstName.toLowerCase(),
    //     compareTo: workspace.name.toLowerCase()
    //   }

    //   return validation.compareWith.includes(validation.compareTo)
    // })

    // const workspace = existingWorkspace ?? 'test';

    return {
      session,
      user,
      activeUser,
      // existingWorkspace,
      // workspace
    }
  } catch (error) {
    throw error;
  }
}
