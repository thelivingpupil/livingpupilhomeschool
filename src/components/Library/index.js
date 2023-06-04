import React, { useState } from 'react';
import Image from 'next/image';
import slugify from 'slugify';

export default ({ book, image }) => {
  const [showDescription, setDescriptionVisibility] = useState(false);

  const toggle = () => setDescriptionVisibility((state) => !state);

  return (
    <div className="flex flex-col justify-center items-center space-y-3 p-2">
      <div>
        <Image
          alt={slugify(book?.title?.toLowerCase())}
          src={image || '/images/livingpupil-homeschool-logo.png'}
          width={200}
          height={300}
        />
      </div>
      <div className="font-bold text-xl text-primary-500">{book?.title}</div>
      <div className="w-full flex flex-col items-start">
        <button
          className="py-1 text-sm underline bg-gray-100 rounded text-secondary-800 hover:text-secondary-600"
          onClick={toggle}
        >
          {showDescription ? 'Hide' : 'Read'} Item Description &raquo;
        </button>
        {showDescription
          ? book?.description && (
              <div className="flex items-start justify-center py-2 space-y-3 text-sm">
                {book?.description}
              </div>
            )
          : null}
      </div>
      <a
        className="flex items-center justify-center py-2 px-3 rounded bg-primary-600 text-white w-2/3 text-sm cursor-pointer hover:bg-primary-500"
        href={`${book?.file}?dl=${slugify(book?.title?.toLowerCase())}.pdf`}
      >
        Download
      </a>
    </div>
  );
};
