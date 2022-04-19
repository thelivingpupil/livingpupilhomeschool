import Image from 'next/image';

const Quote = () => {
  return (
    <section className="relative w-full py-20 bg-[left_-100px_top_1rem] bg-no-repeat bg-[length:300px_300px] bg-secondary-100 bg-asset-3">
      <div className="container flex items-center justify-between mx-auto space-x-10">
        <div className="flex flex-col w-1/2 space-y-10">
          <h2 className="flex flex-col text-5xl font-medium tracking-wide font-display">
            Charlotte Mason
          </h2>
          <p className="mb-8 leading-relaxed">
            Charlotte Mason is an 18th-century educator who believes that
            education should be liberal for all and that parents play a
            significant role in educating their children. She believed that
            children are born persons with capabilities necessary to acquire all
            appropriate knowledge for themselves by feasting on ideas; thus,
            they are not empty vessels that teachers are to fill knowledge with.
          </p>
          <p className="mb-8 leading-relaxed">
            Education is an atmosphere (the natural atmosphere in our homes
            directly affect our children&apos;s education), a discipline (the
            formation of good habits through intentional training) and life
            (learning should be living, through living books and not just the
            presentation of dry facts) became the parent&apos;s motto in her
            schools. Students are taught to memorize “I am, I can, I ought, I
            will” as their motto.
          </p>
          <h3 className="flex items-center justify-center space-x-5 text-3xl font-display">
            <span className="text-secondary-500">I am</span>
            <span className="text-primary-50">&#10022;</span>
            <span className="text-secondary-500">I can</span>
            <span className="text-primary-50">&#10022;</span>
            <span className="text-secondary-500">I ought</span>
            <span className="text-primary-50">&#10022;</span>
            <span className="text-secondary-500">I will</span>
          </h3>
        </div>
        <div className="relative w-1/2 h-[500px]">
          <Image
            alt="Actual Image"
            className="rounded-xl"
            layout="fill"
            loading="lazy"
            objectFit="cover"
            src="https://images.pexels.com/photos/4473990/pexels-photo-4473990.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          />
        </div>
      </div>
    </section>
  );
};

export default Quote;
