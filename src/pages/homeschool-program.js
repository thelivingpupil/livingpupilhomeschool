import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { Enrollment, GradeLevel } from '@prisma/client';

import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import Footer from '@/sections/footer';
import Header from '@/sections/header';
import Title from '@/sections/sectionTitle';
import {
  ACCREDITATION,
  ENROLLMENT_TYPE,
  GRADE_LEVEL,
  GRADE_LEVEL_GROUPS,
  GRADE_LEVEL_HEADER,
} from '@/utils/constants';
import { PortableText } from '@portabletext/react';

const HomeschoolProgram = ({ page, programs }) => {
  const { footer, header } = page;
  const [headerSection] = header?.sectionType;
  const [footerSection] = footer?.sectionType;
  const [enrollmentType, setEnrollmentType] = useState(Enrollment.NEW);
  const [incomingGradeLevel, setIncomingGradeLevel] = useState(
    GradeLevel.PRESCHOOL
  );

  const program = programs.find(
    (program) =>
      program.enrollmentType === enrollmentType &&
      program.gradeLevel === incomingGradeLevel
  );

  return (
    <LandingLayout>
      <Meta title="Living Pupil Homeschool" />
      <Header {...headerSection} />
      <Title
        title="Homeschool Program"
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
        {/* <div className="container mx-auto space-y-3">
          <h3 className="text-lg font-bold text-center">with a</h3>
          <div className="flex flex-col items-center justify-center space-x-0 space-y-3 md:space-y-0 md:space-x-3 md:flex-row">
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${
                accreditation === Accreditation.LOCAL &&
                'text-white bg-primary-500'
              }`}
              onClick={() => setAccreditation(Accreditation.LOCAL)}
            >
              Local Accreditation
            </button>
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${
                accreditation === Accreditation.INTERNATIONAL &&
                'text-white bg-primary-500'
              }`}
              onClick={() => {
                setAccreditation(Accreditation.INTERNATIONAL);
                setIncomingGradeLevel(GradeLevel.K2);
              }}
            >
              International Accreditation
            </button>
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${
                accreditation === Accreditation.DUAL &&
                'text-white bg-primary-500'
              }`}
              onClick={() => {
                setAccreditation(Accreditation.DUAL);
                setIncomingGradeLevel(GradeLevel.K2);
              }}
            >
              Dual Accreditation
            </button>
          </div>
        </div> */}
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
                    <option key={index} value={level}>
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
      <section className="px-5 py-10 flex flex-col items-center">
        <div className="flex flex-col px-5 py-5 bg-primary-200 rounded-lg w-full md:w-3/4">
          <div className="text-4xl font-bold text-secondary-500 text-center mb-3">
            Homeschool Program - {GRADE_LEVEL_HEADER[program?.gradeLevel]}
          </div>
          <div className="font-bold text-white text-center">
            {program?.subheading}
          </div>
        </div>

        <div className="flex flex-col px-5 py-5 w-full md:w-3/4">
          <div className="text-justify font-bold space-y-5">
            <PortableText value={program?.description} />
          </div>
        </div>
        <div className="flex flex-col px-5 py-5 my-5 bg-secondary-500 rounded-lg w-full md:w-3/4">
          <div className="font-bold text-2xl text-primary-200 text-center">
            Tuition Fees and Payment Plan for{' '}
            {ENROLLMENT_TYPE[program?.enrollmentType]} for SY 2023-2024
          </div>
        </div>
        {program?.tuitionFees?.map((tuitionFee) => (
          <div className="flex flex-col pb-5 w-full md:w-3/4">
            <div className="text-xl my-5 text-center font-semibold">
              {ACCREDITATION[tuitionFee?.type]}
            </div>
            <div className="flex flex-col md:flex-wrap md:flex-row gap-4">
              <div className="flex-1 p-5 text-center border border-primary-500 rounded-lg">
                <div className="text-xl font-medium mb-5">Full Payment</div>
                <div className="text-secondary-500 text-2xl font-bold font-display">
                  {`Total: ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(tuitionFee?.paymentTerms[0]?.fullPayment || 0)}`}
                </div>
              </div>
              <div className="flex-1 p-5 text-center border border-primary-500 rounded-lg">
                <div className="text-xl font-medium mb-5">
                  Three (3) Term Payment
                </div>
                <div className="text-primary-500 text-2xl font-bold font-display">
                  {`Down payment: ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(tuitionFee?.paymentTerms[1]?.downPayment || 0)}`}
                </div>
                <div className="text-primary-500 text-2xl font-bold font-display">
                  {`2nd payment: ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(tuitionFee?.paymentTerms[1]?.secondPayment || 0)}`}
                </div>
                <div className="text-primary-500 text-2xl font-bold font-display">
                  {`3rd payment: ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(tuitionFee?.paymentTerms[1]?.thirdPayment || 0)}`}
                </div>
                <div className="text-secondary-500 text-2xl font-bold font-display">
                  {`Total: ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(
                    tuitionFee?.paymentTerms[1]?.downPayment +
                      tuitionFee?.paymentTerms[1]?.secondPayment +
                      tuitionFee?.paymentTerms[1]?.thirdPayment || 0
                  )}`}
                </div>
              </div>
              <div className="flex-1 p-5 text-center border border-primary-500 rounded-lg">
                <div className="text-xl font-medium mb-5">
                  Four (4) Term Payment
                </div>
                <div className="text-primary-500 text-2xl font-bold font-display">
                  {`Down payment: ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(tuitionFee?.paymentTerms[2]?.downPayment || 0)}`}
                </div>
                <div className="text-primary-500 text-2xl font-bold font-display">
                  {`2nd payment: ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(tuitionFee?.paymentTerms[2]?.secondPayment || 0)}`}
                </div>
                <div className="text-primary-500 text-2xl font-bold font-display">
                  {`3rd payment: ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(tuitionFee?.paymentTerms[2]?.thirdPayment || 0)}`}
                </div>
                <div className="text-primary-500 text-2xl font-bold font-display">
                  {`4th payment: ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(tuitionFee?.paymentTerms[2]?.fourthPayment || 0)}`}
                </div>
                <div className="text-secondary-500 text-2xl font-bold font-display">
                  {`Total: ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(
                    tuitionFee?.paymentTerms[2]?.downPayment +
                      tuitionFee?.paymentTerms[2]?.secondPayment +
                      tuitionFee?.paymentTerms[2]?.thirdPayment +
                      tuitionFee?.paymentTerms[2]?.fourthPayment || 0
                  )}`}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex flex-col px-5 py-5 mt-5 bg-primary-500 rounded-lg w-full md:w-3/4">
          <div className="font-bold text-2xl text-secondary-500 text-center">
            Inclusions
          </div>
        </div>
        <div className="flex flex-col px-5 py-5 w-full md:w-3/4">
          <div className="text-justify font-bold space-y-3">
            <PortableText value={program?.inclusions} />
          </div>
        </div>
        {/* <div className="container flex flex-col w-3/4 mx-auto space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
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
        </div> */}
      </section>
      {/* <section className="px-5 py-5 italic">
        <p className="text-sm text-center">
          {accreditation === Accreditation.LOCAL &&
            enrollmentType === Enrollment.CONTINUING && (
              <>
                <strong>Note: </strong>
                <span className="block">
                  Sibling discount is Php 1,000.00 for the second, third, and
                  fourth child
                </span>
              </>
            )}
          {(accreditation === Accreditation.INTERNATIONAL ||
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
          )}
        </p>
      </section> */}
      <Footer {...footerSection} />
    </LandingLayout>
  );
};

export const getStaticProps = async () => {
  const [[header, footer], programs] = await Promise.all([
    sanityClient.fetch(
      `*[_type == 'sections' && (name == 'Common Header' || name == 'Common Footer')]`
    ),
    sanityClient.fetch(
      `*[_type == 'programs' && programType == 'HOMESCHOOL_PROGRAM']`
    ),
  ]);
  return {
    props: {
      page: { footer, header },
      programs,
    },
    revalidate: 10,
  };
};

export default HomeschoolProgram;
