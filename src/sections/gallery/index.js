import { useState } from 'react';
import imageUrlBuilder from '@sanity/image-url';
import Title from '../sectionTitle';
import { Splide, SplideSlide } from '@splidejs/react-splide';

import sanityClient from '@/lib/server/sanity';

const builder = imageUrlBuilder(sanityClient);

const Gallery = ({ title, items }) => {
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const openSlideshow = (index) => {
    setCurrentItemIndex(index);
    setShowSlideshow(true);
  };

  const closeSlideshow = () => {
    setShowSlideshow(false);
  };

  return (
    <>
      <Title title={title} />
      <section className="bg-water-500">
        <div className="container flex flex-col items-center justify-center px-20 py-10 mx-auto md:flex-row">
          <div className="grid w-full grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-4">
            {items.map((item, index) => {
              const { title, description, cover, images } = item;
              const imageAsset = builder.image(cover.asset);
              return (
                <div key={index}>
                  <div
                    className="relative h-40 rounded-lg shadow-lg overflow-hidden cursor-pointer"
                    onClick={() => openSlideshow(index)}
                  >
                    <img
                      className="w-full h-full object-cover"
                      loading="lazy"
                      src={imageAsset.url()}
                      alt={title}
                    />
                    <div className="absolute inset-0 flex items-end justify-start p-4 bg-black bg-opacity-50 rounded-lg">
                      <div>
                        <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
                        <p className="text-white">{description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {showSlideshow && (
  <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="relative mx-auto my-10" style={{ maxWidth: '65vw' }}>
      <button
        onClick={closeSlideshow}
        className="absolute top-4 right-4 text-white z-10 bg-black bg-opacity-50 px-3 py-1 rounded-lg"
      >
        Close
      </button>
      <div className="relative">
        <Splide options={{ type: 'fade', heightRatio: 0.7, rewind: true  }}>
          {items[currentItemIndex].images.map((image, index) => (
            <SplideSlide key={index}>
              <div className="relative">
                <img
                  className="mx-auto max-w-full max-h-full"
                  src={builder.image(image.asset).url()}
                  alt={`Image ${index}`}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </div>
  </div>
)}




    </>
  );
};

export default Gallery;
