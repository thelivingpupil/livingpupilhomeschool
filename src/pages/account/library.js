import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';

const Library = ({ books }) => {
  console.log('books', books);
  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Virtual Library" />
      <Content.Title
        title="Parent and Student Virtual Library"
        subtitle="View and download books dedicated for both parents and students"
      />
      <Content.Divider />
      <Content.Container>
        <div className="flex flex-col">
          <div className="flex space-around">
            <div>Virtual Library</div>
            <div className="flex flex-end">
              <div>options</div>
              <div>search</div>
            </div>
          </div>
          <div>Parents</div>
          <div>Students</div>
        </div>
      </Content.Container>
    </AccountLayout>
  );
};

export const getServerSideProps = async () => {
  const books = await sanityClient.fetch(`*[_type == 'books']`);

  return {
    props: {
      books,
    },
  };
};

export default Library;
