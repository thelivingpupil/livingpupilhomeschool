import { PortableText } from '@portabletext/react';

const Review = ({ content }) => {
  console.log(content);
  return (
    <div className="bg-white">
      {content.map((item, index) => {
        return (
          <section key={index} className="relative w-full">
            <div
              className={`relative w-full bg-no-repeat bg-[length:100px_100px] md:bg-[length:300px_300px] ${
                index % 3 === 0 ? 'bg-asset-6' : 'bg-asset-4'
              } ${
                index % 2 === 0
                  ? 'bg-[left_-50px_top_1rem] md:bg-[left_-100px_top_1rem]'
                  : 'bg-[right-50px_top_1rem] md:bg-[right_-100px_top_1rem]'
              }`}
            >
              <div className="container flex items-center justify-center px-5 py-10 mx-auto space-x-10 md:px-10">
                <div
                  className={`flex flex-col w-full py-10 space-y-5 md:w-3/4 ${
                    index % 2 === 0 ? 'text-left' : 'text-right'
                  }`}
                >
                  <div>
                    <h2 className="flex flex-col text-3xl font-medium tracking-wide md:text-5xl font-display">
                      {item.title}
                    </h2>
                  </div>
                  <div className="flex flex-col items-center justify-center py-5 space-y-3">
                    <PortableText value={item.content} />
                  </div>
                  <div className="flex justify-center mt-6">
                    <div className="inline-flex w-20 h-1 rounded-full bg-secondary-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Review;
