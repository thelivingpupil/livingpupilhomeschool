import React from 'react';
import Image from 'next/image';

const ImageModal = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50 backdrop-blur-sm"  style={{ margin: 0 }}>
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-full relative">
          <div className="absolute top-3 right-3 z-50">
            <button className="text-white text-3xl bg-gray-500 bg-opacity-6 border-none cursor-pointer rounded-full p-2 hover:bg-gray-600"
                onClick={onClose}
                style={{ width: '50px', height: '50px' }} // Adjust the width and height as needed
            >
                &times;
            </button>
          </div>
          <div className="relative z-10">
            <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
              <Image
                src={imageUrl}
                alt="Expanded Image"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
