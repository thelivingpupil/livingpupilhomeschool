const BlogContent = ({ title, description, resource }) => {
  return (
    <section className="body-font">
      <div className="bg-contain ">
        <div className="container px-5 py-24 mx-auto">
          <div className="flex w-full mb-5 space-x-10 md:mb-20">
            <div className="flex flex-col items-center justify-center w-full mb-5 lg:mb-0">
              <h2 className="mb-2 text-2xl font-medium text-center text-primary-600 sm:text-3xl title-font font-display">
                {title}
              </h2>
              <div className="w-20 h-1 rounded bg-secondary-600"></div>
            </div>
          </div>
          <div className="flex flex-wrap">
            <div className="p-4 md:w-1/2">
              <div className="p-6 space-y-5 transition-all rounded-lg shadow hover:shadow-xl hover:-mt-2">
                <p className="text-base leading-relaxed">
                  Fingerstache flexitarian street art 8-bit waistcoat.
                  Distillery hexagon disrupt edison bulbche.
                </p>
                <div className="flex items-center justify-start space-x-5">
                  <img
                    className="object-cover object-center w-20 h-20 rounded"
                    src="https://images.pexels.com/photos/8055836/pexels-photo-8055836.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="content"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-primary-500 title-font">
                      Colosseum Roma
                    </h2>
                    <h3 className="text-xs font-medium tracking-widest text-secondary-500 title-font">
                      SUBTITLE
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 md:w-1/2">
              <div className="p-6 space-y-5 transition-all rounded-lg shadow hover:shadow-xl hover:-mt-2">
                <p className="text-base leading-relaxed">
                  Fingerstache flexitarian street art 8-bit waistcoat.
                  Distillery hexagon disrupt edison bulbche.
                </p>
                <div className="flex items-center justify-start space-x-5">
                  <img
                    className="object-cover object-center w-20 h-20 rounded"
                    src="https://images.pexels.com/photos/3769981/pexels-photo-3769981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="content"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-primary-500 title-font">
                      Colosseum Roma
                    </h2>
                    <h3 className="text-xs font-medium tracking-widest text-secondary-500 title-font">
                      SUBTITLE
                    </h3>
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

export default BlogContent;
