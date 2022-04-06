const Hero = () => {
  return (
    <section className="relative pt-20 text-gray-200 body-font from-primary-500 via-blue-500 to-blue-700 bg-gradient-to-br">
      <div className="w-full bg-bottom bg-no-repeat shadow-inner bg-wave-4">
        <div className="w-full bg-bottom bg-no-repeat shadow-inner bg-wave-3">
          <div className="w-full bg-bottom bg-no-repeat shadow-inner bg-wave-2">
            <div className="w-full bg-bottom bg-no-repeat shadow-inner bg-wave-1-1">
              <div className="w-full pb-20 bg-bottom bg-no-repeat shadow-inner bg-wave-1">
                <div className="container flex flex-col items-center px-5 py-24 mx-auto md:flex-row">
                  <div className="flex flex-col items-center mb-16 text-center md:w-3/4 lg:pr-24 md:pr-16 md:items-start md:text-left md:mb-0">
                    <h1 className="flex flex-col flex-wrap mb-4 space-y-5 text-3xl font-medium tracking-wide text-white title-font sm:text-5xl font-display">
                      <span>The First</span>
                      <span className="bg-left-bottom bg-no-repeat bg-underline-highlight">
                        <p className="drop-shadow-xl">Charlotte Mason</p>
                      </span>
                      <span>Homeschool Provider</span>
                      <span>in the Philippines</span>
                    </h1>
                    <p className="mb-8 leading-relaxed">
                      Following Charlotte Mason&apos;s principle,&nbsp;
                      <strong>Living Pupil Homeschool</strong> gives particular
                      attention to our pupil&apos;s relationship with God, with
                      man, and with the world.
                    </p>
                    <div className="flex justify-center">
                      <button className="inline-flex px-10 py-2 text-lg border-0 rounded-full text-primary-800 bg-secondary-600 focus:outline-none hover:bg-secondary-500">
                        Enroll Now
                      </button>
                      <button className="inline-flex px-10 py-2 ml-4 text-lg text-gray-700 bg-gray-100 border-0 rounded-full focus:outline-none hover:bg-gray-200">
                        Inquire now
                      </button>
                    </div>
                  </div>
                  <div className="relative w-5/6 lg:max-w-lg lg:w-full md:w-1/4">
                    <img
                      className="absolute top-0 object-cover object-center border-8 border-white shadow-xl rotate-[2deg] h-96 w-full"
                      alt="hero"
                      src="https://dummyimage.com/720x600"
                    />
                    <img
                      className="object-cover object-center rotate-[5deg] border-8 border-white shadow-xl h-96 w-full"
                      alt="hero"
                      src="https://images.pexels.com/photos/4473990/pexels-photo-4473990.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    />
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

export default Hero;
