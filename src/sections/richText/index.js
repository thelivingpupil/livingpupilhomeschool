import { PortableText } from '@portabletext/react';
import Title from '@/sections/title';

const RichText = ({ content, title, subtitle }) => {
  return (
    <>
      {title && <Title title={title} subtitle={subtitle} />}
      <section className="px-5 py-5 md:px-0">
        <div className="container flex flex-col px-10 py-10 mx-auto space-y-3 md:px-20">
          <PortableText value={content} />
        </div>
      </section>
    </>
  );
};

export default RichText;
