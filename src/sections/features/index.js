import {
  FaBookOpen,
  FaBookReader,
  FaGraduationCap,
  FaHeart,
  FaPiggyBank,
} from 'react-icons/fa';

const icons = {
  book: FaBookOpen,
  'book-reader': FaBookReader,
  'graduation-cap': FaGraduationCap,
  heart: FaHeart,
  'piggy-bank': FaPiggyBank,
};

const Features = ({ title, description, features }) => {
  return (
    <section className="relative w-full">
      <div className="container flex flex-col px-10 py-20 mx-auto space-y-20 md:py-40 md:px-20">
        <h2 className="flex flex-col text-5xl font-medium tracking-wide text-center font-display">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10 md:gap-y-20">
          {features.map((feature, index) => {
            const Icon = icons[feature.icon];
            return (
              <div key={index} className="flex flex-col space-y-3">
                <div className="flex items-center justify-center w-20 h-20 rounded-lg bg-secondary-500">
                  <Icon className="w-10 h-10 text-primary-500" />
                </div>
                <h3 className="text-xl font-bold">{feature.name}</h3>
                <p className="mb-8 leading-relaxed">{feature.subtitle}</p>
              </div>
            );
          })}
          <div className="flex items-center justify-center space-y-3">
            <h3 className="text-xl font-bold leading-10">{description}</h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
