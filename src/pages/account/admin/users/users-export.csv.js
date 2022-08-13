const UsersExport = () => {};

export const getServerSideProps = async ({ res }) => {
  const content = `
  `;
  res.setHeader('Content-Type', 'text/csv');
  res.write(content);
  res.end();
  return { props: {} };
};

export default UsersExport;
