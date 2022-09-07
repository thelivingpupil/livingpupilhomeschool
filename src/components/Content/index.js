import Link from 'next/link';

const Content = ({ admin, children, route }) => {
  return (
    <div
      id="scroller"
      className={`overflow-y-auto ${
        admin
          ? 'md:w-4/5'
          : route === '/account/enrollment'
          ? 'md:w-full'
          : 'md:w-3/4'
      }`}
    >
      {route === '/account/enrollment' && (
        <div className="w-full p-5 text-center text-white bg-primary-500">
          <Link href="/">
            <a className="flex-grow text-2xl font-bold tourLogo">
              Living Pupil Homeschool
            </a>
          </Link>
        </div>
      )}
      <div className="flex flex-col h-full p-5 space-y-5 md:p-10">
        {children}
      </div>
    </div>
  );
};

Content.Container = ({ children }) => {
  return <div className="flex flex-col pb-20 space-y-5">{children}</div>;
};

Content.Divider = ({ thick }) => {
  return thick ? (
    <hr className="border-2 dark:border-gray-600" />
  ) : (
    <hr className="border dark:border-gray-700" />
  );
};

Content.Empty = ({ children }) => {
  return (
    <div>
      <div className="flex items-center justify-center p-5 bg-gray-100 border-4 border-dashed rounded">
        <p>{children}</p>
      </div>
    </div>
  );
};

Content.Title = ({ subtitle, title }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
      <h3 className="text-gray-400">{subtitle}</h3>
    </div>
  );
};

Content.Container.displayName = 'Container';
Content.Divider.displayName = 'Divider';
Content.Empty.displayName = 'Empty';
Content.Title.displayName = 'Title';

export default Content;
