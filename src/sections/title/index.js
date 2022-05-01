const Title = ({ title, subtitle }) => {
  return (
    <section className="px-5 py-10 md:px-0 bg-secondary-500">
      <div className="container items-center justify-between mx-auto text-center">
        <h1 className="text-6xl font-medium tracking-wide font-display">
          {title}
        </h1>
        <p className="leading-relaxed">{subtitle}</p>
      </div>
    </section>
  );
};

export default Title;
