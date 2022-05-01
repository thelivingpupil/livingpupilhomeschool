const Offering = ({ title, offering }) => {
  return (
    <section className="relative w-full bg-right bg-no-repeat bg-[length:300px_300px] bg-secondary-100 bg-asset-4">
      <div className="container flex flex-col py-20 mx-auto space-y-20">
        <h2 className="flex flex-col text-5xl font-medium tracking-wide text-center font-display">
          {title}
        </h2>
        <div className="grid w-3/4 grid-cols-2 gap-5 mx-auto">
          {offering.map((o, index) => (
            <div key={index} className="w-full p-2">
              <div class="bg-white rounded flex p-5 h-full items-center shadow-lg hover:shadow-xl cursor-pointer">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  className="flex-shrink-0 w-6 h-6 mr-5 text-secondary-500"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                  <path d="M22 4L12 14.01l-3-3"></path>
                </svg>
                <span class="title-font font-medium">{o}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offering;
