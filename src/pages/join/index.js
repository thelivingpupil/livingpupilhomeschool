import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';

import Card from '@/components/Card/index';
import Button from '@/components/Button';
import api from '@/lib/common/api';
import { getInvitation } from '@/prisma/services/user';

const Invite = ({ user }) => {
  const { data } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setSubmittingState] = useState(false);

  const createAccount = () => {
    setSubmittingState(true);
    api(`/api/workspace/team/affiliate`, {
      body: { email, inviteCode: user.userCode },
      method: 'POST',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        if (response.status === 422) {
          router.replace('/account');
        }

        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        setEmail('');
        toast.success(`You may now login with your email address: ${email}`);
      }
    });
  };

  const handleEmailChange = (e) => setEmail(e.target.value);

  return (
    <main className="relative flex flex-col items-center justify-center h-screen space-y-10">
      <Toaster position="bottom-center" toastOptions={{ duration: 10000 }} />
      <div className="w-full py-5">
        <div className="relative flex flex-col mx-auto space-y-5">
          <div className="flex flex-col items-center justify-center mx-auto">
            <Card>
              {!data ? (
                <>
                  <Card.Body
                    title={`You have been invited by ${
                      user.name || user.email
                    }`}
                    subtitle="You are invited to join and enroll your student with Living Pupil Homeschool"
                  >
                    <input
                      className="px-3 py-2 border rounded"
                      onChange={handleEmailChange}
                      placeholder="youremail@mail.com"
                      type="email"
                      value={email}
                    />
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      className="text-white bg-primary-600 hover:bg-primary-600"
                      disabled={isSubmitting}
                      onClick={createAccount}
                    >
                      Join Living Pupil Homeschool
                    </Button>
                    <Link href="/auth/login">
                      <a className="flex items-center justify-center px-5 py-2 space-x-3 bg-white border rounded">
                        Login
                      </a>
                    </Link>
                  </Card.Footer>
                </>
              ) : (
                <>
                  <Card.Body
                    title="You already have a Living Pupil Homeschool account"
                    subtitle="You may want to share this link with your fellow parents"
                  />
                  <Card.Footer>
                    <Link href="/account">
                      <a className="flex items-center justify-center px-5 py-2 space-x-3 text-white rounded bg-primary-600 hover:bg-primary-600">
                        Go Back
                      </a>
                    </Link>
                  </Card.Footer>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export const getServerSideProps = async (context) => {
  const { code } = context.query;
  const user = await getInvitation(code);
  return { props: { user } };
};

export default Invite;
