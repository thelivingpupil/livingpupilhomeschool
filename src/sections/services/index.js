const icons = {
  apple: {
    className: 'bg-green-500/80 border-green-500',
    image: '/images/apple.png',
  },
  backpack: {
    className: 'bg-pink-500/80 border-pink-500',
    image: '/images/backpack.png',
  },
  stroller: {
    className: 'bg-red-500/80 border-red-500',
    image: '/images/stroller.png',
  },
  atom: {
    className: 'bg-orange-500/80 border-orange-500',
    image: '/images/atom.png',
  },
  'earth-globe': {
    className: 'bg-blue-500/80 border-blue-500',
    image: '/images/earth-globe.png',
  },
};

const Services = ({ title, content }) => {
  return (
    <section className="w-full">
      <div className="container px-5 py-24 mx-auto">
        <div className="mb-20 text-center">
          <h2 className="py-5 mb-4 text-2xl text-primary-500 bg-clip-text font-display sm:text-5xl title-font">
            {title}
          </h2>
          <div className="flex justify-center mt-6">
            <div className="inline-flex w-20 h-1 rounded-full bg-secondary-600"></div>
          </div>
        </div>
        <div className="flex flex-wrap items-start justify-center -mx-4 -mt-4 -mb-10 space-y-6 sm:-m-4 md:space-y-0">
          {content.map((c, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-start p-4 mb-10 text-center md:w-1/3"
            >
              <div
                className={`inline-flex items-center justify-center flex-shrink-0 w-20 h-20 mb-5 rounded-full text-primary-600 border-4 ${
                  icons[c.icon].className
                }`}
              >
                <img src={icons[c.icon].image} />
              </div>
              <div className="flex-grow">
                <h2 className="mb-3 text-lg font-bold text-gray-900 title-font">
                  {c.title}
                </h2>
                <p className="text-base leading-relaxed">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
