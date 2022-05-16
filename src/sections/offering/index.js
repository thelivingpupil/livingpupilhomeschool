import { CheckIcon } from '@heroicons/react/outline';
import Image from 'next/image';

const Offering = ({ title, offering }) => {
  return (
    <section className="relative w-full bg-no-repeat">
      <div className="container flex flex-col py-20 mx-auto space-x-10 space-y-20 md:flex-row">
        <div className="relative w-1/2">
          <Image
            alt="Actual Image"
            className="rounded-full"
            layout="fill"
            loading="lazy"
            objectFit="contain"
            src="/images/offers.png"
          />
        </div>
        <div className="space-y-10 md:w-1/2">
          <h2 className="flex flex-col text-5xl font-medium tracking-wide font-display">
            {title}
          </h2>
          <div className="space-y-2">
            {offering.map((o, index) => (
              <div key={index} className="w-full p-2">
                <div class="bg-white rounded flex px-5 items-center space-x-5">
                  <CheckIcon className="w-8 h-8 text-secondary-500" />
                  <span class="title-font font-medium">{o}</span>
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
