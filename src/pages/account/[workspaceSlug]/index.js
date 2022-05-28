import { useState } from 'react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/outline';
import {
  Accreditation,
  Enrollment,
  Gender,
  GradeLevel,
  Program,
  Religion,
} from '@prisma/client';
import differenceInCalendarYears from 'date-fns/differenceInCalendarYears';
import DatePicker from 'react-datepicker';

import Button from '@/components/Button';
import Card from '@/components/Card';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import { AccountLayout } from '@/layouts/index';
import { useWorkspace } from '@/providers/workspace';
import {
  ACCREDITATION,
  ENROLLMENT_TYPE,
  GRADE_LEVEL,
  GRADE_LEVEL_GROUPS,
  PROGRAM,
  RELIGION,
} from '@/utils/constants';

const steps = [
  'Personal Information',
  'Educational Background',
  'Program and Accreditation',
  'School Fees',
];

const Workspace = () => {
  const { workspace } = useWorkspace();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState(Gender.FEMALE);
  const [religion, setReligion] = useState(Religion.ROMAN_CATHOLIC);
  const [reason, setReason] = useState('');
  const [enrollmentType, setEnrollmentType] = useState(Enrollment.NEW);
  const [incomingGradeLevel, setIncomingGradeLevel] = useState(
    GradeLevel.PRESCHOOL
  );
  const [formerSchoolName, setFormerSchoolName] = useState('');
  const [formerSchoolAddress, setFormerSchoolAddress] = useState('');
  const [program, setProgram] = useState(Program.HOMESCHOOL_PROGRAM);
  const [accreditation, setAccreditation] = useState(null);
  const [birthDate, setBirthDate] = useState(new Date());
  const age = differenceInCalendarYears(new Date(), birthDate) || 0;
  const validateNext = !(
    (step === 0 &&
      firstName.length > 0 &&
      middleName.length > 0 &&
      lastName.length > 0 &&
      reason.length > 0) ||
    (step === 1 &&
      formerSchoolName.length > 0 &&
      formerSchoolAddress.length > 0) ||
    (step === 2 && accreditation !== null)
  );

  const goToStep = (step) => setStep(step);

  const next = () => setStep(step + 1);

  const previous = () => setStep(step - 1);

  const renderTab = () => {
    const tabs = [
      renderPersonalInformation,
      renderEducationalBackground,
      renderCurriculum,
      renderSchoolFees,
    ];
    return tabs[step]();
  };

  const renderPersonalInformation = () => {
    return (
      <div className="flex flex-col p-5 space-y-3 overflow-auto">
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Full Name <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="flex flex-row space-x-5">
            <input
              className="px-3 py-2 border rounded md:w-1/3"
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Given Name"
              value={firstName}
            />
            <input
              className="px-3 py-2 border rounded md:w-1/3"
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="Middle Name"
              value={middleName}
            />
            <input
              className="px-3 py-2 border rounded md:w-1/3"
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              value={lastName}
            />
          </div>
        </div>
        <div className="flex flex-row space-x-5">
          <div className="flex flex-col">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Birthday <span className="ml-1 text-red-600">*</span>
            </label>
            <div className="relative flex flex-row">
              <DatePicker
                selected={birthDate}
                onChange={(date) => setBirthDate(date)}
                selectsStart
                startDate={birthDate}
                nextMonthButtonLabel=">"
                previousMonthButtonLabel="<"
                popperClassName="react-datepicker-left"
              />
            </div>
          </div>
          <div className="flex flex-col w-full md:w-1/3">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Age
            </label>
            <div className="relative flex flex-row space-x-5">
              <input
                className="w-full px-3 py-2 border rounded"
                disabled
                value={`${age} years old`}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row space-x-5">
          <div className="flex flex-col w-full md:w-1/2">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Gender <span className="ml-1 text-red-600">*</span>
            </label>
            <div className="flex flex-row">
              <div className="relative inline-block w-full border rounded">
                <select
                  className="w-full px-3 py-2 capitalize rounded appearance-none"
                  onChange={(e) => setGender(e.target.value)}
                  value={gender}
                >
                  {Object.keys(Gender).map((entry, index) => (
                    <option key={index} value={entry}>
                      {entry.toLowerCase()}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full md:w-1/2">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Religion <span className="ml-1 text-red-600">*</span>
            </label>
            <div className="relative inline-block w-full border rounded">
              <select
                className="w-full px-3 py-2 capitalize rounded appearance-none"
                onChange={(e) => setReligion(e.target.value)}
                value={religion}
              >
                {Object.keys(Religion).map((entry, index) => (
                  <option key={index} value={entry}>
                    {RELIGION[entry]}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDownIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Reason for Homeschooling
            <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="relative flex flex-row space-x-5">
            <textarea
              className="w-full px-3 py-2 border rounded"
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why did you choose to homeschool your child?"
              rows={5}
              value={reason}
            ></textarea>
          </div>
        </div>
      </div>
    );
  };

  const renderEducationalBackground = () => {
    return (
      <div className="flex flex-col p-5 space-y-5 overflow-auto">
        <div className="flex flex-row space-x-5">
          <div
            className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/2 ${
              enrollmentType === Enrollment.NEW
                ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                : 'border rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
            }`}
            onClick={() => setEnrollmentType(Enrollment.NEW)}
          >
            {enrollmentType === Enrollment.NEW && (
              <div className="absolute flex items-center justify-center w-10 h-10 text-white rounded-full -right-3 -top-3 bg-primary-400">
                <CheckIcon className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-xl font-bold text-center">New Family</h3>
          </div>
          <div
            className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/2 ${
              enrollmentType === Enrollment.CONTINUING
                ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                : 'border rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
            }`}
            onClick={() => setEnrollmentType(Enrollment.CONTINUING)}
          >
            {enrollmentType === Enrollment.CONTINUING && (
              <div className="absolute flex items-center justify-center w-10 h-10 text-white rounded-full -right-3 -top-3 bg-primary-400">
                <CheckIcon className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-xl font-bold text-center">Continuing Family</h3>
          </div>
        </div>
        <hr className="border border-dashed" />
        <div className="flex flex-row space-x-5">
          <div className="flex flex-col w-full">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Incoming Grade Level <span className="ml-1 text-red-600">*</span>
            </label>
            <div className="flex flex-row">
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
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Former School Name <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="flex flex-row space-x-5">
            <input
              className="px-3 py-2 border rounded md:w-2/3"
              onChange={(e) => setFormerSchoolName(e.target.value)}
              placeholder="Former School Name"
              value={formerSchoolName}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Former School Address <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="relative flex flex-row space-x-5">
            <textarea
              className="w-full px-3 py-2 border rounded"
              onChange={(e) => setFormerSchoolAddress(e.target.value)}
              placeholder="Former School Address"
              rows={3}
              value={formerSchoolAddress}
            ></textarea>
          </div>
        </div>
      </div>
    );
  };

  const renderCurriculum = () => {
    return (
      <div className="flex flex-col p-5 space-y-5 overflow-auto">
        <div className="flex flex-row space-x-5">
          <div
            className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/2 ${
              program === Program.HOMESCHOOL_PROGRAM
                ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                : 'border rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
            }`}
            onClick={() => {
              setProgram(Program.HOMESCHOOL_PROGRAM);
              setAccreditation(null);
            }}
          >
            {program === Program.HOMESCHOOL_PROGRAM && (
              <div className="absolute flex items-center justify-center w-10 h-10 text-white rounded-full -right-3 -top-3 bg-primary-400">
                <CheckIcon className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-xl font-bold text-center">
              Homeschool Program
            </h3>
          </div>
          <div
            className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/2 ${
              incomingGradeLevel === GradeLevel.GRADE_1 ||
              incomingGradeLevel === GradeLevel.GRADE_2 ||
              incomingGradeLevel === GradeLevel.GRADE_3 ||
              incomingGradeLevel === GradeLevel.GRADE_4 ||
              incomingGradeLevel === GradeLevel.GRADE_5 ||
              incomingGradeLevel === GradeLevel.GRADE_6
                ? program === Program.HOMESCHOOL_COTTAGE
                  ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                  : 'border rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
                : 'bg-gray-300 opacity-50 rounded'
            }`}
            onClick={() => {
              if (
                incomingGradeLevel === GradeLevel.GRADE_1 ||
                incomingGradeLevel === GradeLevel.GRADE_2 ||
                incomingGradeLevel === GradeLevel.GRADE_3 ||
                incomingGradeLevel === GradeLevel.GRADE_4 ||
                incomingGradeLevel === GradeLevel.GRADE_5 ||
                incomingGradeLevel === GradeLevel.GRADE_6
              ) {
                setProgram(Program.HOMESCHOOL_COTTAGE);
                setAccreditation(null);
              }
            }}
          >
            {program === Program.HOMESCHOOL_COTTAGE && (
              <div className="absolute flex items-center justify-center w-10 h-10 text-white rounded-full -right-3 -top-3 bg-primary-400">
                <CheckIcon className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-xl font-bold text-center">
              Homeschool Cottage
            </h3>
          </div>
        </div>
        <hr className="border border-dashed" />
        <div className="flex flex-row space-x-5">
          {program === Program.HOMESCHOOL_PROGRAM && (
            <>
              <div
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/3 ${
                  accreditation === Accreditation.LOCAL
                    ? 'border-4 border-dashed rounded-xl border-primary-200 bg-primary-50/50'
                    : 'border border-dashed rounded cursor-pointer hover:border-primary-200 hover:bg-primary-50/25'
                }`}
                onClick={() => setAccreditation(Accreditation.LOCAL)}
              >
                {accreditation === Accreditation.LOCAL && (
                  <div className="absolute flex items-center justify-center w-8 h-8 text-white rounded-full -right-3 -top-3 bg-primary-200">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                )}
                <h3 className="flex flex-col font-medium text-center">
                  <span className="text-lg">Local Accreditation</span>
                  <span className="text-sm">(DepEd Accreditation)</span>
                </h3>
              </div>
              <div
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/3 border-dashed ${
                  incomingGradeLevel !== GradeLevel.PRESCHOOL &&
                  incomingGradeLevel !== GradeLevel.K1
                    ? accreditation === Accreditation.INTERNATIONAL
                      ? 'border-4 rounded-xl border-primary-200 bg-primary-50/50'
                      : 'border rounded cursor-pointer hover:border-primary-200 hover:bg-primary-50/25'
                    : 'bg-gray-300 opacity-50 rounded'
                }`}
                onClick={() => {
                  if (
                    incomingGradeLevel !== GradeLevel.PRESCHOOL &&
                    incomingGradeLevel !== GradeLevel.K1
                  ) {
                    setAccreditation(Accreditation.INTERNATIONAL);
                  }
                }}
              >
                {accreditation === Accreditation.INTERNATIONAL && (
                  <div className="absolute flex items-center justify-center w-8 h-8 text-white rounded-full -right-3 -top-3 bg-primary-200">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                )}
                <h3 className="flex flex-col font-medium text-center">
                  <span className="text-lg">International Accreditation</span>
                  <span className="text-sm">(US Accreditation)</span>
                </h3>
              </div>
              <div
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/3 border-dashed ${
                  incomingGradeLevel !== GradeLevel.PRESCHOOL
                    ? accreditation === Accreditation.DUAL
                      ? 'border-4 rounded-xl border-primary-200 bg-primary-50/50'
                      : 'border rounded cursor-pointer hover:border-primary-200 hover:bg-primary-50/25'
                    : 'bg-gray-300 opacity-50 rounded'
                }`}
                onClick={() => {
                  if (incomingGradeLevel !== GradeLevel.PRESCHOOL) {
                    setAccreditation(Accreditation.DUAL);
                  }
                }}
              >
                {accreditation === Accreditation.DUAL && (
                  <div className="absolute flex items-center justify-center w-8 h-8 text-white rounded-full -right-3 -top-3 bg-primary-200">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                )}
                <h3 className="flex flex-col font-medium text-center">
                  <span className="text-lg">
                    Local and International Accreditation
                  </span>
                  <span className="text-sm">(Dual Accreditation)</span>
                </h3>
              </div>
            </>
          )}
          {program === Program.HOMESCHOOL_COTTAGE && (
            <>
              <div
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/2 border-dashed ${
                  incomingGradeLevel === GradeLevel.GRADE_1 ||
                  incomingGradeLevel === GradeLevel.GRADE_2 ||
                  incomingGradeLevel === GradeLevel.GRADE_3
                    ? accreditation === Accreditation.FORM_ONE
                      ? 'border-4 rounded-xl border-primary-200 bg-primary-50/50'
                      : 'border rounded cursor-pointer hover:border-primary-200 hover:bg-primary-50/25'
                    : 'bg-gray-300 opacity-50 rounded'
                }`}
                onClick={() => {
                  if (
                    incomingGradeLevel === GradeLevel.GRADE_1 ||
                    incomingGradeLevel === GradeLevel.GRADE_2 ||
                    incomingGradeLevel === GradeLevel.GRADE_3
                  ) {
                    setAccreditation(Accreditation.FORM_ONE);
                  }
                }}
              >
                {accreditation === Accreditation.FORM_ONE && (
                  <div className="absolute flex items-center justify-center w-8 h-8 text-white rounded-full -right-3 -top-3 bg-primary-200">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                )}
                <h3 className="flex flex-col font-medium text-center">
                  <span className="text-lg">Form 1</span>
                  <span className="text-sm">(Grades 1 - 3)</span>
                </h3>
              </div>
              <div
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/2 border-dashed ${
                  incomingGradeLevel === GradeLevel.GRADE_4 ||
                  incomingGradeLevel === GradeLevel.GRADE_5 ||
                  incomingGradeLevel === GradeLevel.GRADE_6
                    ? accreditation === Accreditation.FORM_TWO
                      ? 'border-4 rounded-xl border-primary-200 bg-primary-50/50'
                      : 'border rounded cursor-pointer hover:border-primary-200 hover:bg-primary-50/25'
                    : 'bg-gray-300 opacity-50 rounded'
                }`}
                onClick={() => {
                  if (
                    incomingGradeLevel === GradeLevel.GRADE_4 ||
                    incomingGradeLevel === GradeLevel.GRADE_5 ||
                    incomingGradeLevel === GradeLevel.GRADE_6
                  ) {
                    setAccreditation(Accreditation.FORM_TWO);
                  }
                }}
              >
                {accreditation === Accreditation.FORM_TWO && (
                  <div className="absolute flex items-center justify-center w-8 h-8 text-white rounded-full -right-3 -top-3 bg-primary-200">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                )}
                <h3 className="flex flex-col font-medium text-center">
                  <span className="text-lg">Form 2</span>
                  <span className="text-sm">(Grades 4 - 6)</span>
                </h3>
              </div>
            </>
          )}
        </div>
        <div className="p-5 space-y-5 text-xs leading-relaxed bg-gray-100 rounded">
          <h3 className="text-sm font-bold">
            General Policies and Guidelines:
          </h3>
          <ol className="px-5 list-decimal">
            <li>
              Parents who intend to enroll are required to watch our “HOMESCHOOL
              FUNDAMENTALS" videos.
            </li>
            <li>
              Should the parent choose to use Pure Charlotte Mason or A CM
              inspired Curriculum, the parent must attend the CM
              training/workshop faithfully.
            </li>
            <li>
              It is expected of the parents to dutifully fulfill the annual, bi
              annual or quarterly dues and other financial obligation of their
              children on time.
            </li>
          </ol>
          <p>Payment Policies:</p>
          <ol className="px-5 list-disc">
            <li>
              A child is considered fully enrolled only after full payment of
              the annual homeschool fee.
            </li>
          </ol>
        </div>
      </div>
    );
  };

  const renderSchoolFees = () => {
    return (
      <div className="flex flex-col p-5 space-y-5 overflow-auto">
        <div>
          <p>{ENROLLMENT_TYPE[enrollmentType]} Enrollment</p>
          <h2 className="text-2xl text-primary-500">
            {PROGRAM[program]} for {GRADE_LEVEL[incomingGradeLevel]} -{' '}
            {ACCREDITATION[accreditation]}
          </h2>
        </div>
        <div className="flex flex-row space-x-5">
          <div className="flex flex-row items-center justify-between w-full px-5 py-3 space-y-3 border rounded-lg hover:shadow-lg">
            <div>
              <h3 className="text-xl font-bold">Full Payment</h3>
              <div>
                <span className="font-medium">Breakdown: </span>
              </div>
            </div>
            <h3 className="text-xl font-bold"></h3>
          </div>
        </div>
        <div className="flex flex-row space-x-5">
          <div className="flex flex-row items-center justify-between w-full px-5 py-3 space-y-3 border rounded-lg hover:shadow-lg">
            <div>
              <h3 className="text-xl font-bold">Semi Annual</h3>
              <div>
                <span className="font-medium">Breakdown: </span>
              </div>
            </div>
            <h3 className="text-xl font-bold"></h3>
          </div>
        </div>
        <div className="flex flex-row space-x-5">
          <div className="flex flex-row items-center justify-between w-full px-5 py-3 space-y-3 border rounded-lg hover:shadow-lg">
            <div>
              <h3 className="text-xl font-bold">Quarterly</h3>
              <div>
                <span className="font-medium">Breakdown: </span>
              </div>
            </div>
            <h3 className="text-xl font-bold"></h3>
          </div>
        </div>
        <div className="p-5 space-y-5 text-xs leading-relaxed bg-gray-100 rounded">
          <h3 className="text-sm font-bold">Payment Policies:</h3>
          <ol className="px-5 list-decimal">
            <li>
              A 3% interest will be added to the school fee when the parents are
              not able to pay on time.
            </li>
            <li>
              For Post-dated checks, bounced or delayed payments will be
              subjected to 5% interest per month.
            </li>
            <li>
              It is expected of the Parents to submit every quarter the grades
              and assessment, class documentation (at least 2 photos/videos per
              subject per quarter) and eCard page 2 (number of school days,
              traits and teacher&apos;s comments form). At the end of the school
              year, parents should compile in a digital form all the outputs per
              subject and send /share the drive link to LPHS admin. Deadline of
              submission: Q1 & Q2 = January 10, 2023 and Q3 & Q4 = June 8, 2023.
              Failure to submit grades will incur a retard fee of 1,000.00 per
              delay.
            </li>
            <li>
              Students are expected to present an Annual portfolio (Show and
              Tell).
            </li>
            <li>
              All school records will be released after the student has been
              cleared of financial and academic obligations from the LPHS.
            </li>
            <li>
              In case of non-compliance with LPHS requirements and/or the
              student decides to withdraw/ drop out, the tuition fee and
              miscellaneous fees will not be carried over to the next school
              year.
            </li>
            <li>
              Living Pupil Homeschool&apos;s foundation is build on trust and
              relationship with our families. We therefore require our
              Parent-Teachers to do their task with honesty & commitment. Should
              there be homeschool concerns, please communicate directly to our
              team.
            </li>
          </ol>
          <h3 className="text-sm font-bold">
            Refund on Tuition Fees and other fees:
          </h3>
          <p>
            A student who wishes to transfer or withdraw his/her enrollment from
            LPHS would be entitled to a tuition refund provided: (1) he/she
            submit a letter of withdrawal/transfer (2) has already paid the
            tuition and other fees in full. The amount of refund depends on:
          </p>
          <ol className="px-5 list-decimal">
            <li>
              When the student withdraws a week after enrolment, 10% of the
              total annual due will be charged.
            </li>
            <li>
              When the student withdraws two (2) weeks after enrollment, 20% of
              the total annual due will be charged.
            </li>
            <li>
              When the student withdraws one (1) one month after enrollment, no
              refund will be given.
            </li>
            <li>
              There will be no refund for books and other learning materials.
            </li>
            <li>
              When the student withdraw before the school year ends, the parent
              will pay the annual tuition fee for the school records to be
              released.
            </li>
          </ol>
        </div>
      </div>
    );
  };

  return (
    workspace && (
      <AccountLayout>
        <Meta title={`Living Pupil Homeschool - ${workspace.name} | Profile`} />
        <Content.Title
          title={workspace.name}
          subtitle="This is the student record information"
        />
        <Content.Divider />
        <Content.Container>
          <div className="flex flex-wrap justify-between w-full space-x-5">
            {steps.map((name, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center space-y-3 cursor-pointer"
                onClick={() => goToStep(index)}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    step === index
                      ? 'bg-secondary-400'
                      : index < step
                      ? 'bg-green-400'
                      : 'bg-gray-200'
                  }`}
                >
                  {index < step ? (
                    <CheckIcon className="w-5 h-5 text-white" />
                  ) : (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-xs">{name}</span>
              </div>
            ))}
          </div>
          <Card>
            <Card.Body title={steps[step]}>{renderTab()}</Card.Body>
            <Card.Footer>
              {step > 0 ? (
                <Button
                  className="text-white bg-primary-600 hover:bg-primary-500"
                  onClick={previous}
                >
                  Previous
                </Button>
              ) : (
                <span />
              )}
              <Button
                className="text-white bg-primary-600 hover:bg-primary-500"
                // disabled={validateNext}
                onClick={next}
              >
                {step === steps.length - 1 ? 'Proceed' : 'Next'}
              </Button>
            </Card.Footer>
          </Card>
        </Content.Container>
      </AccountLayout>
    )
  );
};

export default Workspace;
