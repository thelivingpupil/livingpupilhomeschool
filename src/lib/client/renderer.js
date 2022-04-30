import dynamic from 'next/dynamic';

const getDynamicComponent = (section) =>
  dynamic(() => import(`../../sections/${section._type}/index`), {
    ssr: true,
  });

const render = (contents) => {
  return contents.map((content, index) => {
    const [section] = content.sectionType;
    const Component = getDynamicComponent(section);
    return <Component key={index} {...section} />;
  });
};

export default render;
