import { StarIcon } from '@heroicons/react/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/outline';
import Link from 'next/link';

const Review = ({ items, more }) => {
  return (
    <>
      <div className="flex items-center justify-center py-10 bg-water-500/50">
        <Link href={more.path}>
          <a className="px-10 py-5 rounded-lg bg-secondary-500" target="_blank">
            {more.name}
          </a>
        </Link>
      </div>
      <div className="space-y-20 bg-water-500/50">
        {items.map((item, index) => {
          return (
            <section key={index} className="relative w-full">
              <div className="relative w-full bg-[left_-50px_top_1rem] md:bg-[left_-100px_top_1rem] bg-no-repeat bg-[length:100px_100px] md:bg-[length:300px_300px] bg-asset-5">
                <div className="relative w-full bg-[left_-25px_top_10rem] md:bg-[left_-50px_top_10rem] bg-no-repeat bg-[length:75px_75px] md:bg-[length:250px_250px] bg-asset-6">
                  <div className="relative w-full bg-[left_-50px_top_15rem] md:bg-[left_-75px_top_13rem] bg-no-repeat bg-[length:125px_125px] md:bg-[length:350px_350px] bg-asset-9">
                    <div className="relative w-full bg-[right_-10px_top_5rem] md:bg-[right_-50px_top_5rem] bg-no-repeat bg-[length:50px_50px] md:bg-[length:200px_200px] bg-asset-6">
                      <div className="relative w-full bg-[right_-5px_top_0rem] md:bg-[right_-20px_top_0rem] bg-no-repeat bg-[length:25px_25px] md:bg-[length:150px_150px] bg-asset-7">
                        <div className="relative w-full bg-[right_-50px_top_10rem] md:bg-[right_-100px_top_10rem] bg-no-repeat bg-[length:100px_100px] md:bg-[length:300px_300px] bg-asset-9">
                          <div className="container flex items-center justify-center px-5 py-10 mx-auto space-x-10 md:px-20">
                            <div className="flex flex-col w-full py-20 space-y-5 md:w-1/2">
                              <div>
                                <h2 className="flex flex-col text-3xl font-medium tracking-wide text-center md:text-5xl font-display">
                                  {item.name}
                                </h2>
                              </div>
                              <div className="flex flex-col items-center justify-center py-5 space-y-3">
                                <p className="px-5 text-lg text-center text-gray-600">
                                  {item.review}
                                </p>
                              </div>
                              <div className="flex items-center justify-center space-x-3">
                                {Array(item.rating).fill(
                                  <StarIcon className="w-10 h-10 text-secondary-500" />
                                )}
                                {Array(5 - item.rating).fill(
                                  <StarIconOutline className="w-10 h-10 text-secondary-500" />
                                )}
                              </div>
                              <div className="flex justify-center mt-6">
                                <div className="inline-flex w-20 h-1 rounded-full bg-primary-600"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
};

export default Review;
