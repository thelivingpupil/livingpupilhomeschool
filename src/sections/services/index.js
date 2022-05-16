const icons = {
  apple: {
    image: '/images/apple.png',
  },
  backpack: {
    image: '/images/backpack.png',
  },
  stroller: {
    image: '/images/stroller.png',
  },
  atom: {
    image: '/images/atom.png',
  },
  'earth-globe': {
    image: '/images/earth-globe.png',
  },
};

const Services = ({ title, content }) => {
  return (
    <section className="relative w-full">
      <div className="w-full bg-bottom bg-no-repeat bg-wave-2">
        <div className="container p-20 mx-auto">
          <div className="mb-20 text-center">
            <h2 className="py-5 mb-4 text-2xl text-primary-500 bg-clip-text font-display sm:text-5xl title-font">
              {title}
            </h2>
            <div className="flex justify-center mt-6">
              <div className="inline-flex w-20 h-1 rounded-full bg-secondary-600"></div>
            </div>
          </div>
          <div className="grid justify-center grid-cols-3 gap-5">
            {content.map((c, index) => (
              <div
                key={index}
                className="flex flex-col p-5 mb-10 bg-white rounded-lg shadow-xl"
              >
                <div className="flex items-center space-x-5">
                  <div className="inline-flex items-center justify-center flex-shrink-0 w-16 h-16 px-2 mb-5 rounded-xl bg-secondary-500 text-primary-600">
                    <img src={icons[c.icon].image} />
                  </div>
                  <h2 className="mb-3 text-xl font-bold text-primary-500 title-font">
                    {c.title}
                  </h2>
                </div>
                <div className="flex-grow">
                  <p className="text-sm leading-relaxed text-gray-800">
                    {c.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
