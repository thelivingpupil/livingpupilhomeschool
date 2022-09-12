import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/outline';
import { signIn, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import isEmail from 'validator/lib/isEmail';

const Presentation = ({ title, video, secondaryVideo }) => {
  const { data } = useSession();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [isSubmitted, setSubmittedState] = useState(false);
  const [email, setEmail] = useState('');
  const validate = isEmail(email);

  const handleEmail = (event) => setEmail(event.target.value);

  const submit = async (event) => {
    event.preventDefault();
    setSubmittedState(false);
    setSubmittingState(true);
    const response = await signIn('email', { email, redirect: false });

    if (response.error === null) {
      toast.success(
        `Thank you! We have received your email (${email}). You may now view our Homeschool Orientation video.`,
        {
          duration: 10000,
        }
      );
      setEmail('');
      setSubmittedState(true);
    }

    setSubmittingState(false);
  };

  return (
    <section className="relative w-full bg-water-500">
      <div className="relative w-full bg-[left_-50px_top_1rem] md:bg-[left_-100px_top_1rem] bg-no-repeat bg-[length:100px_100px] md:bg-[length:300px_300px] bg-asset-5">
        <div className="relative w-full bg-[left_-25px_top_10rem] md:bg-[left_-50px_top_10rem] bg-no-repeat bg-[length:75px_75px] md:bg-[length:250px_250px] bg-asset-6">
          <div className="relative w-full bg-[left_-50px_top_15rem] md:bg-[left_-75px_top_13rem] bg-no-repeat bg-[length:125px_125px] md:bg-[length:350px_350px] bg-asset-9">
            <div className="relative w-full bg-[right_-10px_top_5rem] md:bg-[right_-50px_top_5rem] bg-no-repeat bg-[length:50px_50px] md:bg-[length:200px_200px] bg-asset-6">
              <div className="relative w-full bg-[right_-5px_top_0rem] md:bg-[right_-20px_top_0rem] bg-no-repeat bg-[length:25px_25px] md:bg-[length:150px_150px] bg-asset-7">
                <div className="relative w-full bg-[right_-50px_top_10rem] md:bg-[right_-100px_top_10rem] bg-no-repeat bg-[length:100px_100px] md:bg-[length:300px_300px] bg-asset-9">
                  <div className="container flex items-center justify-center px-5 py-10 mx-auto space-x-10 md:px-20">
                    <div className="flex flex-col w-full space-y-10 md:w-1/2">
                      <div>
                        <h2 className="flex flex-col text-3xl font-medium tracking-wide text-center md:text-5xl font-display">
                          {title}
                        </h2>
                      </div>
                      {isSubmitted || data ? (
                        <div>
                          <div className="mb-5 aspect-w-16 aspect-h-9 rounded-xl overflow-clip">
                            <iframe
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              frameBorder="0"
                              src={video.url}
                            ></iframe>
                          </div>
                          <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-clip">
                            <iframe
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              frameBorder="0"
                              src={secondaryVideo.url}
                            ></iframe>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 space-y-3 md:py-20">
                          <form className="flex w-full bg-white rounded">
                            <input
                              className="w-full px-5 py-3 text-xl bg-transparent shadow-lg focus:shadow-xl outline-0"
                              onChange={handleEmail}
                              placeholder="your@email.com"
                              value={email}
                            />
                            <button
                              className="px-5 rounded-r shadow-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-25"
                              disabled={!validate || isSubmitting}
                              onClick={submit}
                            >
                              <ArrowRightIcon className="w-5 h-5 text-white" />
                            </button>
                          </form>
                          <p className="px-5 text-sm text-center text-gray-600">
                            Your email is required to start watching our
                            Homeschool Orientation. You can use the same email
                            for your Living Pupil Homeschool account.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Presentation;
