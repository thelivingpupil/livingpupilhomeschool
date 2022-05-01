import { PortableText } from '@portabletext/react';
import Link from 'next/link';

const About = ({ title, description, action, video }) => {
  return (
    <section className="relative w-full bg-water-500 bg-asset-2 bg-[length:300px_300px] bg-no-repeat bg-left-top mb-40">
      <div className="container flex items-center justify-center py-10 mx-auto space-x-10 -mb-28">
        <div className="flex flex-col w-1/2 space-y-10">
          {title && (!description || !action) && (
            <div>
              <h2 className="flex flex-col text-5xl font-medium tracking-wide text-center font-display">
                {title}
              </h2>
            </div>
          )}
          <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-clip">
            <iframe
              src={video.url}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        {title && description && action && (
          <div className="relative flex flex-col w-1/2 px-20 space-y-5">
            <div className="absolute right-0 bg-contain -bottom-40 h-60 w-60 bg-asset-1" />
            <h2 className="flex flex-col text-5xl font-medium tracking-wide font-display">
              {title}
            </h2>
            <PortableText value={description} />
            {action && (
              <div className="relative">
                <Link href={action.path}>
                  <a className="inline-block px-3 py-2 text-xs text-center text-white rounded-lg md:px-5 md:py-3 bg-primary-500 hover:bg-primary-400 md:text-base">
                    {action.name}
                  </a>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default About;