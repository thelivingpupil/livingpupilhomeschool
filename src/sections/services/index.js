import {
  FaAward,
  FaBook,
  FaHorse,
  FaPencilAlt,
  FaPuzzlePiece,
} from 'react-icons/fa';

const icons = {
  apple: FaPuzzlePiece,
  backpack: FaPencilAlt,
  stroller: FaHorse,
  atom: FaBook,
  'earth-globe': FaAward,
};

const Services = ({ title, content }) => {
  return (
    <section className="relative w-full">
      <div className="w-full bg-bottom bg-no-repeat bg-wave-2">
        <div className="container px-5 py-10 mx-auto md:p-20">
          <div className="mb-20 text-center">
            <h2 className="py-5 mb-4 text-4xl md:text-2xl text-primary-500 bg-clip-text font-display sm:text-5xl title-font">
              {title}
            </h2>
            <div className="flex justify-center mt-6">
              <div className="inline-flex w-20 h-1 rounded-full bg-secondary-600"></div>
            </div>
          </div>
          <div className="grid justify-center grid-cols-1 gap-2 md:gap-5 md:grid-cols-3">
            {content.map((c, index) => {
              const Icon = icons[c.icon];
              return (
                <div
                  key={index}
                  className="flex flex-col p-5 bg-white rounded-lg shadow-xl"
                >
                  <div className="flex items-center space-x-5">
                    <div className="inline-flex items-center justify-center flex-shrink-0 w-16 h-16 px-2 mb-5 rounded-xl bg-secondary-500">
                      <Icon className="w-10 h-10 text-primary-500" />
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
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
