import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/outline';
import {
  Accreditation,
  Enrollment,
  GradeLevel,
  CottageType,
} from '@prisma/client';

import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import Footer from '@/sections/footer';
import Header from '@/sections/header';
import Title from '@/sections/sectionTitle';
import {
  GRADE_LEVEL,
  GRADE_LEVEL_GROUPS,
  GRADE_LEVEL_TYPES,
} from '@/utils/constants';

const HomeschoolCottage = ({ page, fees }) => {
  const { footer, header } = page;
  const [headerSection] = header?.sectionType;
  const [footerSection] = footer?.sectionType;
  const [enrollmentType, setEnrollmentType] = useState(Enrollment.NEW);
  const [incomingGradeLevel, setIncomingGradeLevel] = useState(
    GRADE_LEVEL_TYPES.K2
  );
  const [accreditation, setAccreditation] = useState(Accreditation.LOCAL);
  const [cottageType, setCottageType] = useState(CottageType.THREE_DAYS_A_WEEK);

  const schoolFee = fees.schoolFees.find((fee) => {
    let gradeLevel = incomingGradeLevel;

    if (
      accreditation === Accreditation.LOCAL &&
      incomingGradeLevel === GradeLevel.K2
    ) {
      gradeLevel = GradeLevel.K2;
    } else if (
      accreditation === Accreditation.FORM_ONE &&
      (incomingGradeLevel === GradeLevel.GRADE_1 ||
        incomingGradeLevel === GradeLevel.GRADE_2 ||
        incomingGradeLevel === GradeLevel.GRADE_3)
    ) {
      gradeLevel = GradeLevel.GRADE_3;
    } else if (
      accreditation === Accreditation.FORM_TWO &&
      (incomingGradeLevel === GradeLevel.GRADE_4 ||
        incomingGradeLevel === GradeLevel.GRADE_5 ||
        incomingGradeLevel === GradeLevel.GRADE_6)
    ) {
      gradeLevel = GradeLevel.GRADE_6;
    } else if (
      accreditation === Accreditation.FORM_THREE &&
      (incomingGradeLevel === GradeLevel.GRADE_7 ||
        incomingGradeLevel === GradeLevel.GRADE_8 ||
        incomingGradeLevel === GradeLevel.GRADE_9 ||
        incomingGradeLevel === GradeLevel.GRADE_10)
    ) {
      gradeLevel = GradeLevel.GRADE_10;
    }

    return (
      fee.accreditation === accreditation &&
      fee.gradeLevel === gradeLevel &&
      fee.type === enrollmentType
    );
  });

  return (
    <LandingLayout>
      <Meta title="Living Pupil Homeschool" />
      <Header {...headerSection} />
      <Title
        title="Homeschool Cottage"
        subtitle="Pre-school - Senior High School"
      />
      <section className="px-5 py-10 space-y-10">
        <div className="container mx-auto space-y-3">
          <h3 className="text-lg font-bold text-center">
            I'd like to enroll as a
          </h3>
          <div className="flex flex-row items-center justify-center space-x-3">
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${
                enrollmentType === Enrollment.NEW && 'text-white bg-primary-500'
              }`}
              onClick={() => setEnrollmentType(Enrollment.NEW)}
            >
              New Family
            </button>
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${
                enrollmentType === Enrollment.CONTINUING &&
                'text-white bg-primary-500'
              }`}
              onClick={() => setEnrollmentType(Enrollment.CONTINUING)}
            >
              Continuing Family
            </button>
          </div>
        </div>
        <div className="container mx-auto space-y-3">
          <h3 className="text-lg font-bold text-center">for cottage program</h3>
          <div className="flex flex-row items-center justify-center space-x-3">
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${
                cottageType === CottageType.THREE_DAYS_A_WEEK &&
                'text-white bg-primary-500'
              }`}
              onClick={() => setCottageType(CottageType.THREE_DAYS_A_WEEK)}
            >
              3 days a week
            </button>
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${
                cottageType === CottageType.WITH_TWO_DAYS_TUTOR &&
                'text-white bg-primary-500'
              }`}
              onClick={() => setCottageType(CottageType.WITH_TWO_DAYS_TUTOR)}
            >
              With 2 days tutor
            </button>
          </div>
        </div>
        <div className="container mx-auto space-y-3">
          <h3 className="text-lg font-bold text-center">with a</h3>
          <div className="flex flex-row items-center justify-center space-x-3">
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${
                incomingGradeLevel === GRADE_LEVEL_TYPES.K2 &&
                'text-white bg-primary-500'
              }`}
              onClick={() => {
                setIncomingGradeLevel(GRADE_LEVEL_TYPES.K2);
              }}
            >
              K2
            </button>
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${
                incomingGradeLevel === GRADE_LEVEL_TYPES.FORM_1 &&
                'text-white bg-primary-500'
              }`}
              onClick={() => {
                setIncomingGradeLevel(GRADE_LEVEL_TYPES.FORM_1);
              }}
            >
              Form 1
            </button>
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${
                incomingGradeLevel === GRADE_LEVEL_TYPES.FORM_2 &&
                'text-white bg-primary-500'
              }`}
              onClick={() => {
                setIncomingGradeLevel(GRADE_LEVEL_TYPES.FORM_2);
              }}
            >
              Form 2
            </button>
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${
                incomingGradeLevel === GRADE_LEVEL_TYPES.FORM_2 &&
                'text-white bg-primary-500'
              }`}
              onClick={() => {
                setIncomingGradeLevel(GRADE_LEVEL_TYPES.FORM_2);
              }}
            >
              Form 3
            </button>
            {cottageType === CottageType.WITH_TWO_DAYS_TUTOR && (
              <>
                <button
                  className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 disabled:opacity-25 ${
                    incomingGradeLevel === GRADE_LEVEL_TYPES.GRADE_11 &&
                    'text-white bg-primary-500'
                  }`}
                  disabled={cottageType === CottageType.THREE_DAYS_A_WEEK}
                  onClick={() => {
                    setIncomingGradeLevel(GRADE_LEVEL_TYPES.GRADE_11);
                  }}
                >
                  Grade 11
                </button>
                <button
                  className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 disabled:opacity-25 ${
                    incomingGradeLevel === GRADE_LEVEL_TYPES.GRADE_12 &&
                    'text-white bg-primary-500'
                  }`}
                  disabled={cottageType === CottageType.THREE_DAYS_A_WEEK}
                  onClick={() => {
                    setIncomingGradeLevel(GRADE_LEVEL_TYPES.GRADE_12);
                  }}
                >
                  Grade 12
                </button>
              </>
            )}
          </div>
        </div>
        <div className="container w-full mx-auto space-y-3 md:w-1/4">
          <div className="relative inline-block w-full border rounded">
            <select
              className="w-full px-3 py-2 capitalize rounded appearance-none"
              onChange={(e) => setIncomingGradeLevel(e.target.value)}
              value={incomingGradeLevel}
            >
              {GRADE_LEVEL_GROUPS.map((group, index) => (
                <optgroup key={index} label={group.name}>
                  {group.levels.map((level, index) => (
                    <option
                      key={index}
                      value={level}
                      disabled={
                        !(
                          accreditation === Accreditation.LOCAL &&
                          level === GradeLevel.K2
                        ) &&
                        !(
                          accreditation === Accreditation.FORM_ONE &&
                          (level === GradeLevel.GRADE_1 ||
                            level === GradeLevel.GRADE_2 ||
                            level === GradeLevel.GRADE_3)
                        ) &&
                        !(
                          accreditation === Accreditation.FORM_TWO &&
                          (level === GradeLevel.GRADE_4 ||
                            level === GradeLevel.GRADE_5 ||
                            level === GradeLevel.GRADE_6)
                        ) &&
                        !(
                          accreditation === Accreditation.FORM_THREE &&
                          (level === GradeLevel.GRADE_7 ||
                            level === GradeLevel.GRADE_8 ||
                            level === GradeLevel.GRADE_9 ||
                            level === GradeLevel.GRADE_10)
                        )
                      }
                    >
                      {GRADE_LEVEL[level]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDownIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>
      <section className="px-5 py-10">
        <div className="container flex flex-col w-3/4 mx-auto space-x-0 space-y-5 md:space-y-0 md:space-x-5 md:flex-row">
          <div className="w-full p-5 space-y-5 text-center border rounded-lg md:w-1/3 border-primary-500">
            <h2 className="text-xl font-medium">Full Payment</h2>
            <h3 className="text-3xl font-bold font-display">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP',
              }).format(schoolFee?.fees[0]?.totalFee || 0)}
            </h3>
          </div>
          <div className="w-full p-5 space-y-5 text-center border rounded-lg md:w-1/3 border-primary-500">
            <h2 className="text-xl font-medium">Semi-Annual Payment</h2>
            <h3 className="text-3xl font-bold font-display">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP',
              }).format(
                schoolFee?.fees[1]?.initialFee +
                  schoolFee?.fees[1]?.semiAnnualFee * 2 || 0
              )}
            </h3>
          </div>
          <div className="w-full p-5 space-y-5 text-center border rounded-lg md:w-1/3 border-primary-500">
            <h2 className="text-xl font-medium">Quarterly Payment</h2>
            <h3 className="text-3xl font-bold font-display">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP',
              }).format(
                Math.ceil(
                  schoolFee?.fees[2]?.initialFee +
                    schoolFee?.fees[2]?.quarterlyFee * 3
                ) || 0
              )}
            </h3>
          </div>
        </div>
      </section>
      <section className="px-5 py-5 italic">
        <p className="text-sm text-center">
          {accreditation === Accreditation.FORM_ONE &&
            enrollmentType === Enrollment.NEW && (
              <>
                <strong>Exclusion: </strong>
                <span className="block">
                  Graduation Fee, Recognition Day Fee Php 12,000.00 Additional
                  Rate for International Accreditation
                </span>
              </>
            )}
          {/* {(accreditation === Accreditation.INTERNATIONAL ||
            accreditation === Accreditation.DUAL) && (
            <>
              <strong>Note: </strong>
              <span className="block">
                Credits Review Fee Php 3,000.00 for Grade 11, Php 7,500.00 for
                Grade 12
              </span>
              <span className="block">
                Graduation Fee for Grade 12 only Php 5,000.00
              </span>
            </>
          )} */}
        </p>
      </section>
      <Footer {...footerSection} />
    </LandingLayout>
  );
};

export const getStaticProps = async () => {
  const [[header, footer], schoolFees] = await Promise.all([
    sanityClient.fetch(
      `*[_type == 'sections' && (name == 'Common Header' || name == 'Common Footer')]`
    ),
    sanityClient.fetch(
      `*[_type == 'schoolFees' && program == 'HOMESCHOOL_COTTAGE']{...}`
    ),
  ]);
  return {
    props: {
      page: { footer, header },
      fees: { schoolFees },
    },
    revalidate: 10,
  };
};

export default HomeschoolCottage;
