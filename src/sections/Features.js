import {
  FaBookOpen,
  FaBookReader,
  FaGraduationCap,
  FaHeart,
  FaPiggyBank,
} from 'react-icons/fa';

const Features = () => {
  return (
    <section className="relative w-full">
      <div className="container flex flex-col py-40 mx-auto space-y-20">
        <h2 className="flex flex-col text-5xl font-medium tracking-wide text-center font-display">
          Our Curriculum
        </h2>
        <div className="grid grid-cols-3 gap-x-10 gap-y-20">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-center w-20 h-20 rounded bg-secondary-500">
              <FaBookReader className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-xl font-bold">Personalized Education</h3>
            <p className="mb-8 leading-relaxed">
              Parents have the freedom to select lessons that tailor fit their
              child&apos;s needs.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-center w-20 h-20 rounded bg-secondary-500">
              <FaGraduationCap className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-xl font-bold">Educating The Whole Person</h3>
            <p className="mb-8 leading-relaxed">
              We train the mind, the body and the will through habit training
              and character education.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-center w-20 h-20 rounded bg-secondary-500">
              <FaHeart className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-xl font-bold">
              Cultivates Deep Love For Learning
            </h3>
            <p className="mb-8 leading-relaxed">
              Rather than focusing only on grades, we aim to ignite the
              student&apos;s deep love for learning.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-center w-20 h-20 rounded bg-secondary-500">
              <FaBookOpen className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-xl font-bold">Living Books</h3>
            <p className="mb-8 leading-relaxed">
              Inspired by Charlotte Mason, our students enjoy a bountiful feast
              of ideas through living books and not just dry facts.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-center w-20 h-20 rounded bg-secondary-500">
              <FaPiggyBank className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-xl font-bold">Affordable</h3>
            <p className="mb-8 leading-relaxed">
              Families can manage their finances with our affordable tuition fee
              and installment plans.
            </p>
          </div>
          <div className="flex items-center justify-center space-y-3">
            <h3 className="text-xl font-medium leading-10">
              The Living Pupil Homeschool gives particular attention towards our
              pupil's relationship with God, with man and with the world.
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
