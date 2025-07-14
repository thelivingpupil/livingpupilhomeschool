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

      <div className="p-5 space-y-5 text-xs leading-relaxed bg-gray-100 rounded my-8">
        <h3 className="text-sm font-bold">
          Marketing Affiliate Program Policy
        </h3>
        <p>PLEASE READ THIS MARKETING AFFILIATE PROGRAM POLICY CAREFULLY.</p>
        <ol className="px-5 list-decimal space-y-2">
          <li className="space-y-1">
            <p>
              <b>Understanding Your Commission</b>
            </p>
            <p>
              Your commission is based on each successful student enrollment, with rates varying depending on the program selected and the parent's chosen payment plan.
            </p>
            <p>
              Where to Find Rates: Current commission rates are always available in the parent portal tool, under the "Affiliate link" menu.
            </p>
            <ul class="list-disc pl-2">
              <li>Full Payment Commission: You'll receive a 5% commission for enrollments paid in full. This commission will be disbursed two months after the full payment has been processed.</li>
              <li>Partial Payment Commission: For enrollments made with a partial payment plan, you'll earn a 3% commission. This commission will be disbursed two months after the final partial payment for that enrollment is received.</li>
            </ul>
            <p>
              Following each successful enrollment, our finance team will reach out to you to confirm your preferred disbursement account and provide a specific commission release schedule.
            </p>
          </li>
          <li className="space-y-1">
            <p>
              <b>Limitations</b>
            </p>
            <p>
              The commission is only applicable for the enrollment of new
              families who are not in an active sales process with us at the
              time of the affiliate link click.
            </p>
            <p>
              The enrolled family must be active enrollees and stay in Living
              Pupil for at least two months. Commissions will be processed after
              two months.
            </p>
            <p>
              Affiliate links may rely on cookies to track referrals. Therefore
              if cookies get cleared, we may be unable to track these events.
            </p>
            <p>
              Only affiliate links can be used to track referrals. Incorrect use
              of affiliate links will cause inability to track referrals.
            </p>
          </li>
          <li className="space-y-1">
            <p>
              <b>Change of program</b>
            </p>
            <p>
              You do not receive an additional commission if a family/parent
              decides to change a program in the future. However, suppose a
              customer chooses to change a program from homeschool cottage to
              homeschool program. In that case, you will receive the commission
              associated with the current program (as long as it is within the
              two months time frame).
            </p>
          </li>
          <li className="space-y-1">
            <p>
              <b>Attribution</b>
            </p>
            <p>
              If a parent clicks two different affiliate links, the last
              affiliate gets the credit. However, we reserve the right to modify
              this in certain circumstances.
            </p>
          </li>
        </ol>
      </div>
    </AccountLayout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  let invitedUsers = [];
  let inviteLink = null;

  const fixDates = (data) => {
    return JSON.parse(JSON.stringify(data));
  };

  if (session) {
    const usersRaw = await getInvitedUsers(session.user?.userCode);
    const users = fixDates(usersRaw);

    inviteLink = `${process.env.APP_URL}/join?code=${encodeURIComponent(
      session.user?.userCode
    )}`;

    invitedUsers = users.map((user) => ({
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
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
