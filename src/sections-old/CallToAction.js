const CallToAction = () => {
  return (
    <section className="z-10 pt-20 pb-20 -mt-5 overflow-hidden text-gray-600 border-t bg-white/30 body-font backdrop-blur-xl border-t-gray-400">
      <div className="absolute left-0 rotate-45 -z-10 w-80 h-80 -top-40 bg-white/30" />
      <div className="container z-20 px-5 py-24 mx-auto border border-gray-100 shadow-xl rounded-2xl">
        <div className="flex flex-col items-start mx-auto lg:w-2/3 sm:flex-row sm:items-center">
          <h1 className="flex-grow text-4xl font-bold text-gray-900 sm:pr-16 title-font">
            Educating pupils with a gentle feast curriculum in an atmosphere of
            love and respect
          </h1>
          <button className="flex-shrink-0 px-8 py-2 mt-10 text-lg text-white border-0 rounded-full bg-primary-600 focus:outline-none hover:bg-primary-600 sm:mt-0">
            Enroll Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
