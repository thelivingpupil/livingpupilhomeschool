import { PortableText } from '@portabletext/react';

const Contact = ({ title, subtitle }) => {
  return (
    <section className="relative body-font">
      <div className="absolute inset-0 bg-gray-300">
        <iframe
          className="opacity-50 contrast-125"
          width="100%"
          height="100%"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          title="map"
          scrolling="no"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3925.8464038103134!2d123.8536281149396!3d10.27395707107576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a99d11e103df21%3A0x52abe59cb72322b4!2sLiving%20Pupil%20Homeschool!5e0!3m2!1sen!2sph!4v1651394950759!5m2!1sen!2sph"
        ></iframe>
      </div>
      <div className="container flex px-5 py-24 mx-auto">
        <div className="relative z-10 flex flex-col w-full p-8 mt-10 space-y-5 bg-white rounded-lg shadow-md lg:w-1/3 md:w-1/2 md:ml-auto md:mt-0">
          <h2 className="mb-1 text-xl font-display title-font">{title}</h2>
          <div className="space-y-2">
            <PortableText value={subtitle} />
          </div>
          <div className="relative mb-4">
            <label htmlFor="email" className="text-sm leading-7 ">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-2 py-1 text-base leading-8 transition-colors duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <div className="relative mb-4">
            <label htmlFor="message" className="text-sm leading-7 ">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              className="w-full h-32 p-2 text-base leading-6 transition-colors duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            ></textarea>
          </div>
          <button className="px-6 py-2 text-lg text-white border-0 rounded bg-primary-500 focus:outline-none hover:bg-primary-600">
            Send a Message
          </button>
        </div>
      </div>
    </section>
  );
};

export default Contact;
