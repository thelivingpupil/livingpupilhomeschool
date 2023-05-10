import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { FaFacebook } from 'react-icons/fa';

const Community = () => {
  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Living Pupil Homeschool Community" />
      <Content.Title
        title="Living Pupil Homeschool Community"
        subtitle="View your Living Pupil Homeschool Community and circle"
      />
      <Content.Divider />
      <Content.Container>
        <Card>
          <Card.Body
            title="A list of links to the various communities of Living Pupil Homeschool"
            subtitle="You may visit our Facebook page for more details"
          >
            <a
              className="w-full py-2 text-center rounded-lg text-primary-500 bg-secondary-500 hover:bg-secondary-600 disabled:opacity-25"
              href="https://www.facebook.com/livingpupilhomeschool"
              target="_blank"
            >
              Visit Facebook Page
            </a>
          </Card.Body>
        </Card>
      </Content.Container>

      <div className="flex flex-row md:flex-col">
        <div className="flex md:flex-row bg-primary-200">
          <Image
            alt="Living Pupil Homeschool"
            src="/images/livingpupil-homeschool-logo.png"
            width={550}
            height={550}
          />
        </div>
        <div className="flex flex-wrap"></div>
      </div>
    </AccountLayout>
  );
};

export default Community;
