import { createRef, useState } from 'react';
import {
  ClockIcon,
  MailIcon,
  MapIcon,
  PhoneIcon,
} from '@heroicons/react/solid';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';
import isEmail from 'validator/lib/isEmail';

import api from '@/lib/common/api';

const Contact = ({ title, subtitle, address, phone, email, hours }) => {
  const recaptchaRef = createRef();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [txtName, setName] = useState('');
  const [txtEmail, setEmail] = useState('');
  const [txtSubject, setSubject] = useState('');
  const [txtMessage, setMessage] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [wasValidated, setValidated] = useState(true);

  const handleNameChange = (e) => setName(e.target.value);

  const handleEmailChange = (e) => setEmail(e.target.value);

  const handleSubjectChange = (e) => setSubject(e.target.value);

  const handleMessageChange = (e) => setMessage(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittingState(true);
    api('/api/public/inquiry', {
      body: {
        captcha,
        name: txtName,
        email: txtEmail,
        subject: txtSubject,
        message: txtMessage,
      },
      method: 'POST',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
        setValidated(false);
      } else {
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        toast.success('Inquiry successfully sent!');
      }
    });
  };

  const onReCAPTCHAChange = (captchaCode) => {
    if (captchaCode) {
      setCaptcha(captchaCode);
    }
  };

  const validName = txtName.length > 1 && txtName.length < 32;

  const validEmail = isEmail(txtEmail);

  const validSubject = txtSubject.length > 1 && txtSubject.length < 32;

  const validMessage = txtMessage.length > 5 && txtMessage.length < 1000;

  const validate = validName && validEmail && validSubject && validMessage;

  return (
    <section className="relative body-font bg-secondary-500">
      <div className="relative bg-[right_-50px_top_1rem] md:bg-[right_-100px_top_1rem] bg-no-repeat bg-[length:100px_100px] md:bg-[length:300px_300px] bg-asset-10">
        <div className="relative bg-[left_-50px_top_20rem] md:bg-[left_75px_top_20rem] bg-no-repeat bg-[length:100px_100px] md:bg-[length:300px_300px] bg-asset-11">
          <div className="w-full bg-bottom bg-no-repeat shadow-inner bg-wave-6">
            <div className="container flex flex-col px-5 pt-10 mx-auto space-x-0 pb-52 md:space-x-10 md:px-20 md:pt-20 md:flex-row">
              <div className="space-y-5 md:w-1/2">
                <h2 className="mb-1 text-5xl font-display title-font">
                  {title}
                </h2>
                <p className="text-sm md:text-base">{subtitle}</p>
                <div className="flex items-center space-x-3 md:space-x-5">
                  <span>
                    <MapIcon className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-lg font-bold">Address</h4>
                    <p className="text-sm text-gray-800">{address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 md:space-x-5">
                  <span>
                    <PhoneIcon className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-lg font-bold">Phone</h4>
                    {phone.map((p, index) => (
                      <p key={index} className="text-sm text-gray-800">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-3 md:space-x-5">
                  <span>
                    <MailIcon className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-lg font-bold">Email</h4>
                    {email.map((e, index) => (
                      <p key={index} className="text-sm text-gray-800">
                        {e}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-3 md:space-x-5">
                  <span>
                    <ClockIcon className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-lg font-bold">Business Hours</h4>
                    {hours.map((h, index) => (
                      <p key={index} className="text-sm text-gray-800">
                        {h}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <form className="relative z-10 flex flex-col w-full p-8 mt-10 space-y-5 bg-white rounded-lg shadow-md md:w-1/2 md:ml-auto md:mt-0">
                <div className="relative">
                  <input
                    id="txtName"
                    className="w-full px-5 py-3 text-base leading-8 transition-colors duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    name="txtName"
                    onChange={handleNameChange}
                    placeholder="Name"
                    type="text"
                    value={txtName}
                  />
                </div>
                <div className="relative">
                  <input
                    id="txtEmail"
                    className="w-full px-5 py-3 text-base leading-8 transition-colors duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    name="txtEmail"
                    onChange={handleEmailChange}
                    placeholder="Email Address"
                    type="email"
                    value={txtEmail}
                  />
                </div>
                <div className="relative">
                  <input
                    id="txtSubject"
                    className="w-full px-5 py-3 text-base leading-8 transition-colors duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    name="txtSubject"
                    onChange={handleSubjectChange}
                    placeholder="Subject"
                    type="text"
                    value={txtSubject}
                  />
                </div>
                <div className="relative">
                  <textarea
                    id="txtMessage"
                    className="w-full h-32 p-5 text-base leading-6 transition-colors duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    name="txtMessage"
                    onChange={handleMessageChange}
                    placeholder="Message"
                    value={txtMessage}
                  ></textarea>
                </div>
                {!wasValidated && (
                  <span className="text-xs text-red-600">
                    Please provide your <strong>name</strong>,{' '}
                    <strong>email</strong>, <strong>subject of inquiry</strong>,
                    and a brief <strong>message</strong> detailing your
                    concerns.
                  </span>
                )}
                <ReCAPTCHA
                  ref={recaptchaRef}
                  className="overflow-hidden"
                  size="normal"
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={onReCAPTCHAChange}
                />
                <button
                  className="px-6 py-2 text-lg border-0 rounded text-secondary-500 bg-primary-500 focus:outline-none hover:bg-primary-600 disabled:opacity-25"
                  disabled={!validate || isSubmitting}
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
