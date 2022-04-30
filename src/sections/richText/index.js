import { PortableText } from '@portabletext/react';

const RichText = ({ content, title, subtitle }) => {
  return (
    <>
      {title && (
        <section className="px-5 py-10 md:px-0 bg-secondary-500">
          <div className="container items-center justify-between mx-auto text-center">
            <h1 className="text-6xl font-medium tracking-wide font-display">
              {title}
            </h1>
            <p className="leading-relaxed">{subtitle}</p>
          </div>
        </section>
      )}
      <section className="px-5 py-5 md:px-0">
        <div className="container flex flex-col px-10 py-10 mx-auto space-y-3 md:px-20">
          <PortableText value={content} />
        </div>
      </section>
    </>
  );
};

export default RichText;
