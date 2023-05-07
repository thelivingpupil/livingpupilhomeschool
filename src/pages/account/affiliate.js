import { DocumentDuplicateIcon } from '@heroicons/react/outline';
import format from 'date-fns/format';
import CopyToClipboard from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';

import Card from '@/components/Card/index';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import { AccountLayout } from '@/layouts/index';
import { getSession } from 'next-auth/react';
import { getInvitedUsers } from '@/prisma/services/user';

const Affiliate = ({ invitedUsers, inviteLink }) => {
  const copyToClipboard = () => toast.success('Copied to clipboard!');

  return (
    <AccountLayout>
      <Meta title="Living Pupil - Affiliate Management" />
      <Content.Title
        title="Invite a Parent"
        subtitle="Share the Living Pupil Homeschool experience with your fellow parents by sharing your affiliate/invite link"
      />
      <Content.Divider />
      <Content.Container>
        <Card>
          <Card.Body
            title="Affiliate Link"
            subtitle="Invite other parents to enroll their kids with Living Pupil Homeschool"
          >
            <div className="flex items-center justify-between px-3 py-2 space-x-5 font-mono text-sm border rounded">
              <span className="overflow-x-auto">{inviteLink}</span>
              <CopyToClipboard onCopy={copyToClipboard} text={inviteLink}>
                <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-primary-600" />
              </CopyToClipboard>
            </div>
          </Card.Body>
        </Card>
      </Content.Container>
      <Content.Divider thick />
      <Content.Title
        title="Invited Parents"
        subtitle="Parents who have used your link will be listed here"
      />
      <Content.Divider />
      <Content.Container>
        <Card>
          <Card.Body title="Parents who signed up using your invite link">
            <table className="table-fixed">
              <thead className="text-gray-400 border-b">
                <tr>
                  <th className="py-3 text-left">Email/Name</th>
                  <th className="py-3 text-right">Date Joined</th>
                  <th className="py-3 text-right">Enrolled Student Count</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {invitedUsers.map((user, index) => (
                  <tr key={index}>
                    <td className="py-5">
                      <div className="flex flex-row items-center justify-start space-x-3">
                        <div className="flex flex-col">
                          <h3 className="font-bold">{user.name || '-'}</h3>
                          <h4 className="text-gray-400">{user.email}</h4>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-row items-center justify-end space-x-3">
                        <span>
                          {user.createdAt
                            ? format(new Date(user.createdAt), 'MMMM dd, yyyy')
                            : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-row items-center justify-end space-x-3">
                        <span>{user.createdWorkspace?.length || 0}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card.Body>
        </Card>
      </Content.Container>
    </AccountLayout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  let invitedUsers = [];
  let inviteLink = null;

  if (session) {
    const users = await getInvitedUsers(session.user?.userCode);
    inviteLink = `${process.env.APP_URL}/join?code=${encodeURI(
      session.user?.userCode
    )}`;
    invitedUsers = users.map((user) => ({
      ...user,
      createdAt: user.createdAt ? user.createdAt.toDateString() : null,
    }));
  }

  return {
    props: {
      invitedUsers,
      inviteLink,
    },
  };
};

export default Affiliate;
