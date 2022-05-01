const Features = () => {
  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="mb-20 text-center">
          <h1 className="py-5 mb-4 text-2xl text-transparent text-primary-600 bg-clip-text bg-gradient-to-r from-primary-600 to-primary-300 font-display sm:text-5xl title-font drop-shadow-xl">
            Welcome to Living Pupil Homeschool
          </h1>
          {/* <p className="mx-auto text-base leading-relaxed xl:w-2/4 lg:w-3/4 text-gray-600s">
            Educating pupils with a gentle feast curriculum in an atmosphere of
            love and respect. Following Charlotte Mason’s principle, Living
            Pupil Homeschool gives particular attention our pupil’s relationship
            with God, with man and with the world.
          </p> */}
          <div className="flex justify-center mt-6">
            <div className="inline-flex w-20 h-1 rounded-full bg-secondary-600"></div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center -mx-4 -mt-4 -mb-10 space-y-6 sm:-m-4 md:space-y-0">
          <div className="flex flex-col items-center p-4 text-center md:w-1/3">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-20 h-20 mb-5 rounded-full text-primary-600 bg-[#C32738]/80 border-[#C32738] border-4">
              <img src="/images/stroller.png" />
            </div>
            <div className="flex-grow">
              <h2 className="mb-3 text-lg font-bold text-gray-900 title-font">
                Pre-School
              </h2>
              <p className="text-base leading-relaxed">
                Blue bottle crucifix vinyl post-ironic four dollar toast vegan
                taxidermy. Gastropub indxgo juice poutine, ramps microdosing
                banh mi pug VHS try-hard.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center p-4 text-center md:w-1/3">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-20 h-20 mb-5 rounded-full text-primary-600 bg-[#56BA4B]/80 border-4 border-[#56BA4B]">
              <img src="/images/apple.png" />
            </div>
            <div className="flex-grow">
              <h2 className="mb-3 text-lg font-bold text-gray-900 title-font">
                Kindergarten
              </h2>
              <p className="text-base leading-relaxed">
                Blue bottle crucifix vinyl post-ironic four dollar toast vegan
                taxidermy. Gastropub indxgo juice poutine, ramps microdosing
                banh mi pug VHS try-hard.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center p-4 text-center md:w-1/3">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-20 h-20 mb-5 rounded-full text-primary-600 bg-[#EA1769]/80 border-[#EA1769] border-4">
              <img src="/images/backpack.png" />
            </div>
            <div className="flex-grow">
              <h2 className="mb-3 text-lg font-bold text-gray-900 title-font">
                Grade School
              </h2>
              <p className="text-base leading-relaxed">
                Blue bottle crucifix vinyl post-ironic four dollar toast vegan
                taxidermy. Gastropub indxgo juice poutine, ramps microdosing
                banh mi pug VHS try-hard.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center p-4 text-center md:w-1/3">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-20 h-20 mb-5 rounded-full text-primary-600 bg-[#F69520]/80 border-4 border-[#F69520]">
              <img src="/images/atom.png" />
            </div>
            <div className="flex-grow">
              <h2 className="mb-3 text-lg font-bold text-gray-900 title-font">
                High School
              </h2>
              <p className="text-base leading-relaxed">
                Blue bottle crucifix vinyl post-ironic four dollar toast vegan
                taxidermy. Gastropub indxgo juice poutine, ramps microdosing
                banh mi pug VHS try-hard.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center p-4 text-center md:w-1/3">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-20 h-20 mb-5 rounded-full text-primary-600 bg-[#166DB7]/80 border-4 border-[#166DB7]">
              <img src="/images/earth-globe.png" />
            </div>
            <div className="flex-grow">
              <h2 className="mb-3 text-lg font-bold text-gray-900 title-font">
                Senior High
              </h2>
              <p className="text-base leading-relaxed">
                Blue bottle crucifix vinyl post-ironic four dollar toast vegan
                taxidermy. Gastropub indxgo juice poutine, ramps microdosing
                banh mi pug VHS try-hard.
              </p>
            </div>
          </div>
        </div>
        {/* <button className="flex px-10 py-2 mx-auto mt-16 text-lg text-white border-0 rounded-full bg-primary-600 focus:outline-none hover:bg-primary-600">
          Learn More
        </button> */}
      </div>
    </section>
  );
};

export default Features;