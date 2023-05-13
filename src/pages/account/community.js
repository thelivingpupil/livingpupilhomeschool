import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import {
  FaBookOpen,
  FaFacebook,
  FaFacebookMessenger,
  FaGlobe,
  FaHome,
} from 'react-icons/fa';
import { HiOutlineUserGroup } from 'react-icons/hi';
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

      <div className="flex flex-row xs:flex-col pb-20">
        <div className="flex items-end flex-1">
          <div className="flex items-end flex-1">
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
          <a
            href="https://www.facebook.com/livingpupilhomeschool"
            target="_blank"
          >
            <div className="flex flex-col xs:flex-row bg-secondary-500 p-8 items-center rounded-xl mt-5 ml-5">
              <FaFacebookMessenger size={100} color="#17A9FD" />
              <span className="text-lg text-white font-semibold p-2 max-w-[150px] text-center">
                Facebook Messenger Group
              </span>
            </div>
          </a>

          <div className="flex flex-col xs:flex-row bg-primary-500 p-8 items-center rounded-xl mt-5 ml-5">
            <HiOutlineUserGroup size={100} color="#FFFFFF" />
            <span className="text-lg text-white font-semibold p-2 max-w-[150px] text-center">
              Living Pupil Support Team
            </span>
          </div>
          <div className="flex flex-col xs:flex-row bg-[#4e5ba5] p-8 items-center rounded-xl mt-5 ml-5">
            <FaBookOpen size={100} color="#FFFFFF" />
            <span className="text-lg text-white font-semibold p-2 max-w-[150px] text-center">
              LP Bookclub (Exlusive for LP Parents)
            </span>
          </div>
          <div className="flex flex-col xs:flex-row bg-secondary-500 p-8 items-center rounded-xl mt-5 ml-5">
            <FaHome size={100} color="#FFFFFF" />
            <span className="text-lg text-white font-semibold p-2 max-w-[150px] text-center">
              Living Pupil Marketplace (Facebook Page)
            </span>
          </div>
          <div className="flex flex-col xs:flex-row bg-[#6d85bb] p-8 items-center rounded-xl mt-5 ml-5">
            <FaGlobe size={100} color="#FFFFFF" />
            <span className="text-lg text-white font-semibold p-2 max-w-[150px] text-center">
              Living Pupil Website
            </span>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
};

export default Community;
