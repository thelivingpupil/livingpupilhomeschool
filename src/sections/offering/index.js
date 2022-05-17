import { CheckIcon } from '@heroicons/react/outline';
import Image from 'next/image';

const Offering = ({ title, offering }) => {
  return (
    <section className="relative w-full bg-no-repeat">
      <div className="container flex flex-col-reverse mx-auto space-x-0 space-y-10 md:space-x-10 md:space-y-20 md:py-20 md:flex-row">
        <div className="relative w-full h-80 md:h-auto md:w-1/2">
          <Image
            alt="Actual Image"
            className="rounded-full"
            layout="fill"
            loading="lazy"
            objectFit="contain"
            src="/images/offers.png"
          />
        </div>
        <div className="w-full space-y-10 md:w-1/2">
          <h2 className="flex flex-col px-5 text-5xl font-medium tracking-wide text-center font-display md:text-left">
            {title}
          </h2>
          <div className="space-y-2">
            {offering.map((o, index) => (
              <div key={index} className="w-full p-2">
                <div className="flex items-center px-5 space-x-5 bg-white rounded">
                  <CheckIcon className="w-8 h-8 text-secondary-500" />
                  <span className="font-medium title-font">{o}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offering;
