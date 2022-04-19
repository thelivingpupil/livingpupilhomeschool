import Image from 'next/image';
import Link from 'next/link';

const About = () => {
  return (
    <section className="relative w-full bg-water-500 bg-asset-2 bg-[length:300px_300px] bg-no-repeat bg-left-top">
      <div className="container flex items-center justify-between py-10 mx-auto space-x-10 -mb-28">
        <div className="relative w-1/2 h-[500px]">
          <Image
            alt="Actual Image"
            className="rounded-xl"
            layout="fill"
            loading="lazy"
            objectFit="cover"
            src="https://images.pexels.com/photos/4473990/pexels-photo-4473990.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          />
        </div>
        <div className="relative flex flex-col w-1/2 px-20 space-y-5">
          <div className="absolute right-0 bg-contain -bottom-40 h-60 w-60 bg-asset-1" />
          <h2 className="flex flex-col text-5xl font-medium tracking-wide font-display">
            Our Philosophy
          </h2>
          <p className="mb-8 leading-relaxed">
            Educating pupils with a gentle feast curriculum in ar atmosphere of
            love and respect. Following Charlotte Mason's principle, Living
            Pupil Homeschool gives particular attention to our pupil&apos;s
            relationship with God, with man, and with the world.
          </p>
          <div className="relative">
            <Link href="/">
              <a className="inline-block px-5 py-3 rounded-lg bg-secondary-500 hover:bg-secondary-400">
                Know More
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
