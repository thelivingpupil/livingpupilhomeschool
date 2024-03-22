import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Enrollment, CottageType } from '@prisma/client';
import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import Footer from '@/sections/footer';
import Header from '@/sections/header';
import Title from '@/sections/sectionTitle';
import {
  ACCREDITATION,
  ENROLLMENT_TYPE,
  GRADE_LEVEL_HEADER,
  GRADE_LEVEL_TYPES,
} from '@/utils/constants';
import { PortableText } from '@portabletext/react';

const HomeschoolCottage = ({ page, programs }) => {
  const router = useRouter();
  const { footer, header } = page;
  const [headerSection] = header?.sectionType;
  const [footerSection] = footer?.sectionType;
  const [enrollmentType, setEnrollmentType] = useState(Enrollment.NEW);
  const [incomingGradeLevel, setIncomingGradeLevel] = useState(GRADE_LEVEL_TYPES.K2);
  const [cottageType, setCottageType] = useState(CottageType.THREE_DAYS_A_WEEK);

  useEffect(() => {
    // Extract values from query parameters in the URL
    const { enrollmentType, incomingGradeLevel, cottageType } = router.query;
    if (enrollmentType) setEnrollmentType(enrollmentType);
    if (incomingGradeLevel) setIncomingGradeLevel(incomingGradeLevel);
    if (cottageType) setCottageType(cottageType);
  }, [router.query]);

  const program = programs.find(
    (program) =>
      program.enrollmentType === enrollmentType &&
      program.gradeLevel === incomingGradeLevel &&
      program.cottageType === cottageType
  );

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
              onClick={() => {
                setCottageType(CottageType.THREE_DAYS_A_WEEK);
                if (
                  [
                    GRADE_LEVEL_TYPES.GRADE_11,
                    GRADE_LEVEL_TYPES.GRADE_12,
                  ].includes(incomingGradeLevel)
                ) {
                  setIncomingGradeLevel(GRADE_LEVEL_TYPES.K2);
                }
              }}
            >
              3 days a week
            </button>
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${
                cottageType === CottageType.FIVE_DAYS_A_WEEK &&
                'text-white bg-primary-500'
              }`}
              onClick={() => setCottageType(CottageType.FIVE_DAYS_A_WEEK)}
            >
              5 days a week
            </button>
          </div>
        </div>
        <div className="container mx-auto space-y-3">
          <h3 className="text-lg font-bold text-center">for</h3>
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
                incomingGradeLevel === GRADE_LEVEL_TYPES.FORM_3 &&
                'text-white bg-primary-500'
              }`}
              onClick={() => {
                setIncomingGradeLevel(GRADE_LEVEL_TYPES.FORM_3);
              }}
            >
              Form 3
            </button>
            {cottageType === CottageType.FIVE_DAYS_A_WEEK && (
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
      </section>
      <section className="px-5 py-10 flex flex-col items-center">
        <div
          className="flex flex-col px-5 py-5 rounded-lg w-full md:w-3/4"
          style={{ backgroundColor: '#7189BE' }}
        >
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
          <div
            className="font-bold text-2xl text-center"
            style={{ color: '#7189BE' }}
          >
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
      </section>
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
      `*[_type == 'programs' && programType == 'HOMESCHOOL_COTTAGE']`
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

export default HomeschoolCottage;
