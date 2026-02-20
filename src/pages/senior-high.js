import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { Enrollment, GradeLevel, Program } from '@prisma/client';

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
  calculateMonthlyPayment,
  getMonthIndexCurrent
} from '@/utils/constants';
import { PortableText } from '@portabletext/react';

const HomeschoolProgram = ({ page, programs }) => {
  const { footer, header } = page;
  const [headerSection] = header?.sectionType;
  const [footerSection] = footer?.sectionType;
  const [enrollmentType, setEnrollmentType] = useState(Enrollment.NEW);
  const [incomingGradeLevel, setIncomingGradeLevel] = useState(
    GradeLevel.GRADE_11
  );

  const [incomingProgram, setIncomingProgram] = useState(
    Program.HOMESCHOOL_PROGRAM
  );

  const program = programs.find(
    (program) =>
      program.enrollmentType === enrollmentType &&
      program.gradeLevel === incomingGradeLevel &&
      program.programType === incomingProgram
  );

  const [monthIndex, setMonthIndex] = useState(null);
  useEffect(() => {
    setMonthIndex(getMonthIndexCurrent(new Date()));
  }, []);


  return (
    <LandingLayout>
      <Meta title="Living Pupil Homeschool" />
      <Header {...headerSection} />
      <Title title="Senior High School" subtitle="Grade 11 - Grade 12" />
      <section className="px-5 py-10 space-y-10">
        <div className="container mx-auto space-y-3">
          <h3 className="text-lg font-bold text-center">
            I'd like to enroll as a
          </h3>
          <div className="flex flex-row items-center justify-center space-x-3">
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${enrollmentType === Enrollment.NEW && 'text-white bg-primary-500'
                }`}
              onClick={() => setEnrollmentType(Enrollment.NEW)}
            >
              New Family
            </button>
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${enrollmentType === Enrollment.CONTINUING &&
                'text-white bg-primary-500'
                }`}
              onClick={() => setEnrollmentType(Enrollment.CONTINUING)}
            >
              Continuing Family
            </button>
          </div>
        </div>
        <div className="container mx-auto space-y-3">
          <h3 className="text-lg font-bold text-center">for program</h3>
          <div className="flex flex-row items-center justify-center space-x-3">
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${incomingProgram === Program.HOMESCHOOL_PROGRAM &&
                'text-white bg-primary-500'
                }`}
              onClick={() => setIncomingProgram(Program.HOMESCHOOL_PROGRAM)}
            >
              Homeschool Program
            </button>
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${incomingProgram === Program.HOMESCHOOL_COTTAGE &&
                'text-white bg-primary-500'
                }`}
              onClick={() => setIncomingProgram(Program.HOMESCHOOL_COTTAGE)}
              hidden
            >
              Homeschool Cottage
            </button>
          </div>
        </div>
        <div className="container mx-auto space-y-3">
          <h3 className="text-lg font-bold text-center">for grade</h3>
          <div className="flex flex-row items-center justify-center space-x-3">
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${incomingGradeLevel === GradeLevel.GRADE_11 &&
                'text-white bg-primary-500'
                }`}
              onClick={() => setIncomingGradeLevel(GradeLevel.GRADE_11)}
            >
              Grade 11
            </button>
            <button
              className={`px-10 py-3 font-medium rounded-lg hover:text-white hover:bg-primary-500 border-2 border-primary-500 ${incomingGradeLevel === GradeLevel.GRADE_12 &&
                'text-white bg-primary-500'
                }`}
              onClick={() => setIncomingGradeLevel(GradeLevel.GRADE_12)}
            >
              Grade 12
            </button>
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
          <div className="text-justify font-bold space-y-3">
            <PortableText value={program?.description} />
          </div>
        </div>
        <div className="flex flex-col px-5 py-5 my-5 bg-secondary-500 rounded-lg w-full md:w-3/4">
          <div
            className="font-bold text-2xl text-center"
            style={{ color: '#7189BE' }}
          >
            Tuition Fees and Payment Plan for{' '}
            {ENROLLMENT_TYPE[program?.enrollmentType]} for SY 2026-2027
          </div>
        </div>
        {program?.tuitionFees?.map((tuitionFee) => (
          <>
            <div className="flex flex-col pb-5 w-full md:w-3/4">
              <div className="text-xl my-5 text-center font-semibold">
                {ACCREDITATION[tuitionFee?.type]}
              </div>
              <div className="flex flex-col md:flex-wrap md:flex-row gap-4">
                <div className="flex-1 p-5 text-center border border-primary-500 rounded-lg">
                  <div className="text-xl font-medium mb-5">Full Payment</div>
                  <div className="text-secondary-500 text-xl font-bold font-display">
                    {`Total: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format((tuitionFee?.paymentTerms[0]?.fullPayment || 0) + 500)}`}
                  </div>
                </div>
                <div className="flex-1 p-5 text-center border border-primary-500 rounded-lg">
                  <div className="text-xl font-medium mb-5">
                    Three (3) Term Payment
                  </div>
                  <div className="text-primary-500 text-xl font-bold font-display">
                    {`Down payment: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(tuitionFee?.paymentTerms[1]?.downPayment || 0)}`}
                  </div>
                  <div className="text-primary-500 text-xl font-bold font-display">
                    {`2nd payment: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format((tuitionFee?.paymentTerms[1]?.secondPayment || 0) + 250)}`}
                  </div>
                  <div className="text-primary-500 text-xl font-bold font-display">
                    {`3rd payment: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format((tuitionFee?.paymentTerms[1]?.thirdPayment || 0) + 250)}`}
                  </div>
                  <div className="text-secondary-500 text-xl font-bold font-display">
                    {`Total: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      (tuitionFee?.paymentTerms[1]?.downPayment || 0) +
                      (tuitionFee?.paymentTerms[1]?.secondPayment || 0) +
                      (tuitionFee?.paymentTerms[1]?.thirdPayment || 0) + 500
                    )}`}
                  </div>
                </div>
                <div className="flex-1 p-5 text-center border border-primary-500 rounded-lg">
                  <div className="text-xl font-medium mb-5">
                    Four (4) Term Payment
                  </div>
                  <div className="text-primary-500 text-xl font-bold font-display">
                    {`Down payment: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(tuitionFee?.paymentTerms[2]?.downPayment || 0)}`}
                  </div>
                  <div className="text-primary-500 text-xl font-bold font-display">
                    {`2nd payment: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format((tuitionFee?.paymentTerms[2]?.secondPayment || 0) + 500 / 3)}`}
                  </div>
                  <div className="text-primary-500 text-xl font-bold font-display">
                    {`3rd payment: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format((tuitionFee?.paymentTerms[2]?.thirdPayment || 0) + 500 / 3)}`}
                  </div>
                  <div className="text-primary-500 text-xl font-bold font-display">
                    {`4th payment: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format((tuitionFee?.paymentTerms[2]?.fourthPayment || 0) + 500 / 3)}`}
                  </div>
                  <div className="text-secondary-500 text-xl font-bold font-display">
                    {`Total: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      Math.ceil(
                        (tuitionFee?.paymentTerms[2]?.downPayment || 0) +
                        (tuitionFee?.paymentTerms[2]?.secondPayment || 0) +
                        (tuitionFee?.paymentTerms[2]?.thirdPayment || 0) +
                        (tuitionFee?.paymentTerms[2]?.fourthPayment || 0) + 500
                      )
                    )}`}
                  </div>

                </div>
                <div className="flex-1 p-5 text-center border border-primary-500 rounded-lg">
                  <div className="text-xl font-medium mb-5">
                    Monthly Term Payment
                  </div>
                  <div className="text-primary-500 text-xl font-bold font-display">
                    {`Down payment: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(tuitionFee?.paymentTerms[3]?.downPayment || 0)}`}
                  </div>
                  <div className="text-primary-500 text-xl font-bold font-display">
                    {`${monthIndex} monthly payments: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      ((tuitionFee?.paymentTerms[3]?.secondPayment || 0) +
                        (tuitionFee?.paymentTerms[3]?.thirdPayment || 0) +
                        (tuitionFee?.paymentTerms[3]?.fourthPayment || 0) +
                        (tuitionFee?.paymentTerms[3]?.fifthPayment || 0) +
                        (tuitionFee?.paymentTerms[3]?.sixthPayment || 0) +
                        (tuitionFee?.paymentTerms[3]?.seventhPayment || 0) +
                        (tuitionFee?.paymentTerms[3]?.eighthPayment || 0) +
                        (tuitionFee?.paymentTerms[3]?.ninthPayment || 0) + 500) / (monthIndex || 1)
                    )}`}
                  </div>
                  <div className="text-secondary-500 text-xl font-bold font-display">
                    {`Total: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      (tuitionFee?.paymentTerms[3]?.downPayment || 0) +
                      (tuitionFee?.paymentTerms[3]?.secondPayment || 0) +
                      (tuitionFee?.paymentTerms[3]?.thirdPayment || 0) +
                      (tuitionFee?.paymentTerms[3]?.fourthPayment || 0) +
                      (tuitionFee?.paymentTerms[3]?.fifthPayment || 0) +
                      (tuitionFee?.paymentTerms[3]?.sixthPayment || 0) +
                      (tuitionFee?.paymentTerms[3]?.seventhPayment || 0) +
                      (tuitionFee?.paymentTerms[3]?.eighthPayment || 0) +
                      (tuitionFee?.paymentTerms[3]?.ninthPayment || 0) + 500
                    )}`}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col rounded-lg w-full md:w-3/4">
              <div className="text-xl font-semibold">
                <p>Other Fees:</p>
                <ul className="list-disc pl-5 ml-5">
                  <li>Graduation Fee (K2, G6, G10, G12): ₱3,500</li>
                  <li>Recognition Fee (All Levels): ₱1,000</li>
                </ul>
                <p className="mt-3">
                  <strong>Note:</strong> Books and optional Living Pupil events and activities are billed separately and are not included in the tuition fee.
                </p>
              </div>
            </div>
          </>
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
      `*[_type == 'programs' && (gradeLevel == 'GRADE_11' || gradeLevel == 'GRADE_12')]`
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
