import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import FacebookProvider from 'next-auth/providers/facebook';
import GoogleProvider from 'next-auth/providers/google';

import prisma from '@/prisma/index';
import { html, text } from '@/config/email-templates/signin';
import { emailConfig, sendMail } from '@/lib/server/mail';
import { InvitationStatus } from '@prisma/client';

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.userId = user.id;
        session.user.userType = user.userType;
        session.user.userCode = user.userCode;
        session.user.deletedAt = user.deletedAt;
        session.user.studentRecords = await prisma.workspace.count({
          where: {
            members: {
              some: {
                email: session.user.email,
                deletedAt: null,
                status: InvitationStatus.ACCEPTED,
              },
            },
            deletedAt: null,
          },
        });
      }

      return session;
    },
  },
  debug: !(process.env.NODE_ENV === 'production'),
  events: {
    // signIn: async ({ user, isNewUser }) => {
    //   const customerPayment = await getPayment(user.email);
    //   if (isNewUser || customerPayment === null || user.createdAt === null) {
    //     await createPaymentAccount(user.email, user.id);
    //   }
    // },
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      server: emailConfig,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const { host } = new URL(url);
        await sendMail({
          html: html({ email, url }),
          subject: `[Living Pupil Homeschool] Sign in to ${host}`,
          text: text({ email, url }),
          to: email,
        });
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || null,
  session: {
    jwt: true,
  },
});
