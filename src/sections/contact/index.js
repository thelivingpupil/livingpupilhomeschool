import {
  ClockIcon,
  MailIcon,
  MapIcon,
  PhoneIcon,
} from '@heroicons/react/solid';

const Contact = ({ title, subtitle, address, phone, email, hours }) => {
  return (
    <section className="relative body-font bg-secondary-500">
      <div className="relative w-full bg-[right_-50px_top_1rem] md:bg-[right_-100px_top_1rem] bg-no-repeat bg-[length:100px_100px] md:bg-[length:300px_300px] bg-asset-10">
        <div className="relative w-full bg-[left_-50px_top_20rem] md:bg-[left_75px_top_20rem] bg-no-repeat bg-[length:100px_100px] md:bg-[length:300px_300px] bg-asset-11">
          <div className="w-full bg-bottom bg-no-repeat shadow-inner bg-wave-6">
            <div className="container flex flex-col pt-10 mx-auto space-x-0 pb-52 md:space-x-10 md:px-20 md:pt-20 md:flex-row">
              <div className="space-y-5 md:w-1/2">
                <h2 className="mb-1 text-5xl font-display title-font">
                  {title}
                </h2>
                <p>{subtitle}</p>
                <div className="flex items-center space-x-5">
                  <span>
                    <MapIcon className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-lg font-bold">Address</h4>
                    <p className="text-sm text-gray-800">{address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-5">
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
                <div className="flex items-center space-x-5">
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
                <div className="flex items-center space-x-5">
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
              <div className="relative z-10 flex flex-col w-full p-8 mt-10 space-y-5 bg-white rounded-lg shadow-md md:w-1/2 md:ml-auto md:mt-0">
                <div className="relative">
                  {/* <label htmlFor="email" className="text-sm leading-7 ">
                Name
              </label> */}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Name"
                    className="w-full px-5 py-3 text-base leading-8 transition-colors duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div className="relative">
                  {/* <label htmlFor="email" className="text-sm leading-7 ">
                Email Address
              </label> */}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email Address"
                    className="w-full px-5 py-3 text-base leading-8 transition-colors duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div className="relative">
                  {/* <label htmlFor="email" className="text-sm leading-7 ">
                Subject
              </label> */}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Subject"
                    className="w-full px-5 py-3 text-base leading-8 transition-colors duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div className="relative">
                  {/* <label htmlFor="message" className="text-sm leading-7 ">
                Message
              </label> */}
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Message"
                    className="w-full h-32 p-5 text-base leading-6 transition-colors duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  ></textarea>
                </div>
                <button className="px-6 py-2 text-lg border-0 rounded text-secondary-500 bg-primary-500 focus:outline-none hover:bg-primary-600">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
