import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { FaFacebook } from 'react-icons/fa';
import Image from 'next/image';

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

      <div className="flex flex-row xs:flex-col pb-20">
        <div className="flex items-end flex-1 h-3/4">
          <div className="flex items-end flex-1 h-full">
            <div className="flex flex-col xs:flex-row bg-water-500 pt-28 pb-8 items-center rounded-xl flex-1">
              <Image
                alt="Living Pupil Homeschool"
                src="/images/livingpupil-homeschool-logo.png"
                width={200}
                height={200}
              />
              <span className="text-lg text-primary-500 font-semibold p-2 max-w-[150px] text-center">
                Living Pupil Community
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 space-x-5 space-y-5">
          <div className="flex flex-col xs:flex-row bg-water-500 p-8 items-center rounded-xl mt-5 ml-5">
            <FaFacebook size={200} color="#3b5998" />
            <span className="text-lg text-primary-500 font-semibold p-2 max-w-[150px] text-center">
              Living Pupil Facebook Page
            </span>
          </div>
          <div className="flex flex-col xs:flex-row bg-water-500 p-8 items-center rounded-xl">
            <Image
              alt="Living Pupil Homeschool"
              src="/images/livingpupil-homeschool-logo.png"
              width={200}
              height={200}
            />
            <span className="text-lg text-primary-500 font-semibold p-2 max-w-[150px] text-center">
              Living Pupil Community
            </span>
          </div>
          <div className="flex flex-col xs:flex-row bg-water-500 p-8 items-center rounded-xl">
            <Image
              alt="Living Pupil Homeschool"
              src="/images/livingpupil-homeschool-logo.png"
              width={200}
              height={200}
            />
            <span className="text-lg text-primary-500 font-semibold p-2 max-w-[150px] text-center">
              Living Pupil Community
            </span>
          </div>
          <div className="flex flex-col xs:flex-row bg-water-500 p-8 items-center rounded-xl">
            <Image
              alt="Living Pupil Homeschool"
              src="/images/livingpupil-homeschool-logo.png"
              width={200}
              height={200}
            />
            <span className="text-lg text-primary-500 font-semibold p-2 max-w-[150px] text-center">
              Living Pupil Community
            </span>
          </div>
          <div className="flex flex-col xs:flex-row bg-water-500 p-8 items-center rounded-xl">
            <Image
              alt="Living Pupil Homeschool"
              src="/images/livingpupil-homeschool-logo.png"
              width={200}
              height={200}
            />
            <span className="text-lg text-primary-500 font-semibold p-2 max-w-[150px] text-center">
              Living Pupil Community
            </span>
          </div>
          <div className="flex flex-col xs:flex-row bg-water-500 p-8 items-center rounded-xl">
            <Image
              alt="Living Pupil Homeschool"
              src="/images/livingpupil-homeschool-logo.png"
              width={200}
              height={200}
            />
            <span className="text-lg text-primary-500 font-semibold p-2 max-w-[150px] text-center">
              Living Pupil Community
            </span>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
};

export default Community;
