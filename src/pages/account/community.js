import { useMemo } from 'react';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import {
  FaBookOpen,
  FaFacebook,
  FaFacebookMessenger,
  FaGlobe,
  FaHome,
  FaCommentDots
} from 'react-icons/fa';
import { HiOutlineUserGroup } from 'react-icons/hi';
import Image from 'next/image';
import { useWorkspaces } from '@/hooks/data';

const formGradeLevels = {
  KINDER: {
    grades: ['K1', 'K2'],
    title: 'K1 & K2 parents',
    url: 'https://m.me/j/AbbL9iaOGC3zXStR/',
  },
  FORM_1: {
    grades: ['GRADE_1', 'GRADE_2', 'GRADE_3'],
    title: 'Grade 1-3 Parents',
    url: 'https://m.me/j/AbY19X_tskHnJCAM/',
  },
  FORM_2: {
    grades: ['GRADE_4', 'GRADE_5', 'GRADE_6'],
    title: 'Grade 4-6 Parents',
    url: 'https://m.me/j/AbafH0XOzI9MzEKu/',
  },
  FORM_3: {
    grades: ['GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10'],
    title: 'Grade 7-10 Parents',
    url: 'https://m.me/j/AbakbwKDgy0q8DLr/',
  },
};



const Community = () => {
  const { data } = useWorkspaces();

  const availableGrades = useMemo(() => {
    if (!data) {
      return [];
    }

    return data?.workspaces
      ?.filter((workspace) => workspace?.studentRecord)
      ?.map((workspace) => workspace?.studentRecord?.incomingGradeLevel);
  }, [data]);

  const availableMessengerGroups = useMemo(
    () =>
      Object.keys(formGradeLevels).filter((form) => {
        const formGradeLevel = formGradeLevels[form];

        return formGradeLevel?.grades?.find((gradeLevel) =>
          availableGrades.includes(gradeLevel)
        );
      }),
    [availableGrades]
  );

  const showBookClubLink = useMemo(() => {
    // Check if any grade between 7 and 10 is in the available grades
    const grades7to10 = ['GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10'];
    return availableGrades.some((grade) => grades7to10.includes(grade));
  }, [availableGrades]);

  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Living Pupil Homeschool Community" />
      <Content.Title
        title="Living Pupil Homeschool Community"
        subtitle="View your Living Pupil Homeschool Community and circle"
      />
      <Content.Divider />

      <div className="flex flex-col md:flex-row pb-20">
        <div className="flex items-end flex-1">
          <div className="h-full flex items-end flex-1">
            <div className="h-4/5 flex flex-col xs:flex-row bg-water-500 pt-28 pb-8 items-center rounded-xl flex-1">
              <Image
                alt="Living Pupil Homeschool"
                src="/images/livingpupil-homeschool-logo.png"
                width={200}
                height={200}
              />
              <span className="text-lg text-primary-500 font-semibold p-2 max-w-[200px] text-center">
                Living Pupil Community
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 space-x-5 space-y-5">
          <a
            className="flex mt-5 ml-5"
            href="https://www.facebook.com/livingpupilhomeschool"
            target="_blank"
          >
            <div className="flex flex-col xs:flex-row bg-water-600 p-8 items-center rounded-xl mt-5 ml-5">
              <FaFacebook size={100} color="#0165E1" />
              <span className="text-lg text-white font-semibold p-2 max-w-[200px] text-center">
                Living Pupil Facebook Page
              </span>
            </div>
          </a>
          {availableMessengerGroups?.map((form) => {
            const formGradeLevel = formGradeLevels[form];
            return (
              <a className="flex" href={formGradeLevel?.url} target="_blank">
                <div className="flex flex-col xs:flex-row bg-secondary-500 p-8 items-center rounded-xl mt-5 ml-5">
                  <FaFacebookMessenger size={100} color="#17A9FD" />
                  <span className="text-lg text-white font-semibold p-2 max-w-[200px] text-center">
                    Facebook Messenger Group {formGradeLevel?.title}
                  </span>
                </div>
              </a>
            );
          })}
          <a className="flex" href="/files/lp-support-team.pdf" target="_blank">
            <div className="flex flex-col xs:flex-row bg-primary-500 p-8 items-center rounded-xl mt-5 ml-5">
              <HiOutlineUserGroup size={100} color="#FFFFFF" />
              <span className="text-lg text-white font-semibold p-2 max-w-[200px] text-center">
                Living Pupil Support Team
              </span>
            </div>
          </a>
          <a className="flex" href="/files/lp-communication-guide.pdf" target="_blank">
            <div className="flex flex-col xs:flex-row bg-water-700 p-8 items-center rounded-xl mt-5 ml-5">
              <FaCommentDots size={100} color="#FFFFFF" />
              <span className="text-lg text-white font-semibold p-2 max-w-[200px] text-center">
                Living Pupil Communication Guide
              </span>
            </div>
          </a>
          {showBookClubLink && (
            <a
              className="flex"
              href="https://forms.gle/U9v68obw1Q7N9BmH8"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex flex-col xs:flex-row bg-[#4e5ba5] p-8 items-center rounded-xl mt-5 ml-5">
                <FaBookOpen size={100} color="#FFFFFF" />
                <span className="text-lg text-white font-semibold p-2 max-w-[200px] text-center">
                  Ourselves: Book Club
                </span>
              </div>
            </a>
          )}
          <a
            className="flex"
            href="https://www.facebook.com/groups/328866131938778/"
            target="_blank"
          >
            <div className="flex flex-col xs:flex-row bg-secondary-500 p-8 items-center rounded-xl mt-5 ml-5">
              <FaHome size={100} color="#FFFFFF" />
              <span className="text-lg text-white font-semibold p-2 max-w-[200px] text-center">
                Living Pupil Marketplace (Facebook Page)
              </span>
            </div>
          </a>
          <a
            className="flex"
            href="https://livingpupilhomeschool.com"
            target="_blank"
          >
            <div className="flex flex-col xs:flex-row bg-[#6d85bb] p-8 items-center rounded-xl mt-5 ml-5">
              <FaGlobe size={100} color="#FFFFFF" />
              <span className="text-lg text-white font-semibold p-2 max-w-[200px] text-center">
                Living Pupil Website
              </span>
            </div>
          </a>
        </div>
      </div>
    </AccountLayout>
  );
};

export default Community;
