import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getProviders, signIn, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import isEmail from 'validator/lib/isEmail';

import Meta from '@/components/Meta/index';
import { AuthLayout } from '@/layouts/index';

const Login = () => {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState('');
  const [isSubmitting, setSubmittingState] = useState(false);
  const [socialProviders, setSocialProviders] = useState([]);
  const validate = isEmail(email);

  const disableLogin = false;

  // Get callbackUrl from query params to preserve redirect after login
  const callbackUrl = router.query.callbackUrl;

  const handleEmailChange = (event) => setEmail(event.target.value);

  const signInWithEmail = async (event) => {
    event.preventDefault();
    setSubmittingState(true);

    // Include callbackUrl in signIn options
    const signInOptions = { email, redirect: false };
    if (callbackUrl) {
      signInOptions.callbackUrl = decodeURIComponent(callbackUrl);
    }

    const response = await signIn('email', signInOptions);

    if (response.error === null) {
      toast.success(`Please check your email (${email}) for the login link.`, {
        duration: 5000,
      });
      setEmail('');
    }

    setSubmittingState(false);
  };

  const signInWithSocial = (socialId) => {
    // Include callbackUrl for social sign-in
    const signInOptions = {};
    if (callbackUrl) {
      signInOptions.callbackUrl = decodeURIComponent(callbackUrl);
    }
    signIn(socialId, signInOptions);
  };

  useEffect(() => {
    const loadProviders = async () => {
      const socialProviders = [];
      const { email, ...providers } = await getProviders();

      for (const provider in providers) {
        socialProviders.push(providers[provider]);
      }

      setSocialProviders(socialProviders);
    };

    loadProviders();
  }, []);

  return (
    <AuthLayout>
      <Meta
        title="NextJS SaaS Boilerplate | Login"
        description="A boilerplate for your NextJS SaaS projects."
      />

      {disableLogin ? (
        <div className="flex flex-col items-center justify-center p-5 m-auto space-y-5 rounded shadow-lg md:p-10 md:w-1/3">
          <Link href="/">
            <a>
              <Image
                alt="Living Pupil Homeschool"
                src="/images/livingpupil-homeschool-logo.png"
                width={80}
                height={80}
              />
            </a>
          </Link>
          <Link href="/">
            <a className="text-4xl font-bold text-center text-primary-500">
              Living Pupil Homeschool
            </a>
          </Link>
          <h1 className="text-xl font-bold text-center text-red-600">
            Important Announcement: Website Maintenance
          </h1>
          <p className="text-center text-gray-600">
            Dear Parents and Students,
          </p>
          <p className="text-center text-gray-600">
            We regret to inform you that we are currently experiencing technical
            difficulties with our website. Our team is actively working to
            resolve the issue, and we expect the website to be fully operational
            within the next 24-72 hours.
          </p>
          <p className="text-center text-gray-600">
            We apologize for any inconvenience this may cause and appreciate
            your patience and understanding during this time.
          </p>
          <p className="text-center text-gray-600">
            Thank you for your continued support.
          </p>
          <p className="text-center text-gray-600">
            Sincerely,
            <br />
            The Living Pupil Homeschool Team
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-5 m-auto space-y-5 rounded shadow-lg md:p-10 md:w-1/3">
          <Link href="/">
            <a>
              <Image
                alt="Living Pupil Homeschool"
                src="/images/livingpupil-homeschool-logo.png"
                width={80}
                height={80}
              />
            </a>
          </Link>
          <Link href="/">
            <a className="text-4xl font-bold text-center text-primary-500">
              Living Pupil Homeschool
            </a>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Sign in with your email</h1>
            <h2 className="text-gray-600">
              We&apos;ll send a magic link to your inbox to confirm your email
              address and sign you in.
            </h2>
          </div>
          <form className="flex flex-col w-full space-y-3">
            <input
              className="px-3 py-2 border rounded"
              onChange={handleEmailChange}
              placeholder="user@email.com"
              type="email"
              value={email}
            />
            <button
              className="py-2 text-white rounded bg-primary-600 hover:bg-primary-600 disabled:opacity-50"
              disabled={status === 'loading' || !validate || isSubmitting}
              onClick={signInWithEmail}
            >
              {status === 'loading'
                ? 'Checking session...'
                : isSubmitting
                ? 'Sending the link...'
                : 'Send the Magic Link'}
            </button>
          </form>
          {socialProviders.length > 0 && (
            <>
              <span className="text-sm text-gray-400">or sign in with</span>
              <div className="flex flex-col w-full space-y-3">
                {socialProviders.map((provider, index) => (
                  <button
                    key={index}
                    className="py-2 bg-gray-100 border rounded hover:bg-gray-50 disabled:opacity-50"
                    disabled={status === 'loading'}
                    onClick={() => signInWithSocial(provider.id)}
                  >
                    {provider.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </AuthLayout>
  );
};

export default Login;
