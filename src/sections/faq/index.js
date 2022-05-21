import { useState } from 'react';
import { PortableText } from '@portabletext/react';

import Title from '../sectionTitle';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/outline';

const FAQItem = ({ item }) => {
  const [showFAQ, setFAQVisibility] = useState(false);

  const toggle = () => setFAQVisibility(!showFAQ);

  return (
    <div
      className="flex flex-col p-5 space-y-5 bg-white border-2 border-gray-500 rounded-lg shadow-lg cursor-pointer hover:shadow-xl"
      onClick={toggle}
    >
      <div className="flex items-center space-x-5">
        <div className="w-5">
          {showFAQ ? (
            <ChevronDownIcon className="w-5 h-5" />
          ) : (
            <ChevronRightIcon className="w-5 h-5" />
          )}
        </div>
        <p className="font-bold">{item.question}</p>
      </div>
      {showFAQ && <PortableText value={item.answer} />}
    </div>
  );
};

const FAQ = ({ title, items }) => {
  return (
    <>
      <Title title={title} />
      <section>
        <div className="w-full bg-bottom bg-no-repeat shadow-inner bg-wave-1">
          <div className="container flex flex-col items-center justify-center px-10 py-20 mx-auto md:px-40 md:flex-row">
            <div className="flex flex-col w-full space-y-10">
              {items.map((item, index) => (
                <FAQItem key={index} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQ;
