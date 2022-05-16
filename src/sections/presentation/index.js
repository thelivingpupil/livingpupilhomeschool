const Presentation = ({ title, video }) => {
  return (
    <section className="relative w-full bg-water-500">
      <div className="relative w-full bg-[left_-50px_top_1rem] md:bg-[left_-100px_top_1rem] bg-no-repeat bg-[length:100px_100px] md:bg-[length:300px_300px] bg-asset-5">
        <div className="relative w-full bg-[left_-25px_top_10rem] md:bg-[left_-50px_top_10rem] bg-no-repeat bg-[length:75px_75px] md:bg-[length:250px_250px] bg-asset-6">
          <div className="relative w-full bg-[left_-20px_top_15rem] md:bg-[left_-75px_top_15rem] bg-no-repeat bg-[length:125px_125px] md:bg-[length:350px_350px] bg-asset-9">
            <div className="relative w-full bg-[right_-10px_top_5rem] md:bg-[right_-50px_top_5rem] bg-no-repeat bg-[length:50px_50px] md:bg-[length:200px_200px] bg-asset-6">
              <div className="relative w-full bg-[right_-5px_top_0rem] md:bg-[right_-20px_top_0rem] bg-no-repeat bg-[length:25px_25px] md:bg-[length:150px_150px] bg-asset-7">
                <div className="relative w-full bg-[right_-50px_top_10rem] md:bg-[right_-100px_top_10rem] bg-no-repeat bg-[length:100px_100px] md:bg-[length:300px_300px] bg-asset-9">
                  <div className="container flex items-center justify-center px-5 py-10 mx-auto space-x-10 md:px-20">
                    <div className="flex flex-col w-full space-y-10 md:w-1/2">
                      <div>
                        <h2 className="flex flex-col text-3xl font-medium tracking-wide text-center md:text-5xl font-display">
                          {title}
                        </h2>
                      </div>
                      <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-clip">
                        <iframe
                          src={video.url}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
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
};

export default Presentation;
