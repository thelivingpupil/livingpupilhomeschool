import { useState } from 'react';
import { CheckIcon, ChevronDownIcon, UserIcon } from '@heroicons/react/outline';
import {
  Accreditation,
  Enrollment,
  Gender,
  GradeLevel,
  PaymentType,
  Program,
  Religion,
} from '@prisma/client';
import differenceInCalendarYears from 'date-fns/differenceInCalendarYears';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';

import Button from '@/components/Button';
import Card from '@/components/Card';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import Modal from '@/components/Modal';
import { AccountLayout } from '@/layouts/index';
import api from '@/lib/common/api';
import sanityClient from '@/lib/server/sanity';
import { useWorkspace } from '@/providers/workspace';
import {
  ACCREDITATION,
  ENROLLMENT_TYPE,
  GRADE_LEVEL,
  GRADE_LEVEL_GROUPS,
  PROGRAM,
  RELIGION,
} from '@/utils/constants';
import format from 'date-fns/format';

const steps = [
  'Personal Information',
  'Educational Background',
  'Program and Accreditation',
  'School Fees',
];

const Workspace = ({ schoolFees }) => {
  const { workspace } = useWorkspace();
  const [step, setStep] = useState(0);
  const [viewFees, setViewFees] = useState(false);
  const [isSubmitting, setSubmittingState] = useState(false);
  const [review, setReviewVisibility] = useState(false);
  const [agree, setAgree] = useState(false);
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
  const [payment, setPayment] = useState(null);
  const [fee, setFee] = useState(null);
  const [birthDate, setBirthDate] = useState(new Date());
  const age = differenceInCalendarYears(new Date(), birthDate) || 0;
  const validateNext =
    (step === 0 &&
      firstName.length > 0 &&
      lastName.length > 0 &&
      reason.length > 0) ||
    (step === 1 &&
      formerSchoolName.length > 0 &&
      formerSchoolAddress.length > 0) ||
    (step === 2 && accreditation !== null) ||
    (step === 3 && payment !== null && agree);
  const schoolFee = schoolFees.find((fee) => {
    let gradeLevel = incomingGradeLevel;

    if (program === Program.HOMESCHOOL_PROGRAM) {
      if (
        incomingGradeLevel === GradeLevel.GRADE_1 ||
        incomingGradeLevel === GradeLevel.GRADE_2 ||
        incomingGradeLevel === GradeLevel.GRADE_3 ||
        incomingGradeLevel === GradeLevel.GRADE_4 ||
        incomingGradeLevel === GradeLevel.GRADE_5 ||
        incomingGradeLevel === GradeLevel.GRADE_6
      ) {
        gradeLevel = GradeLevel.GRADE_6;
      } else if (
        incomingGradeLevel === GradeLevel.GRADE_7 ||
        incomingGradeLevel === GradeLevel.GRADE_8 ||
        incomingGradeLevel === GradeLevel.GRADE_9 ||
        incomingGradeLevel === GradeLevel.GRADE_10
      ) {
        gradeLevel = GradeLevel.GRADE_10;
      } else if (
        incomingGradeLevel === GradeLevel.GRADE_11 ||
        incomingGradeLevel === GradeLevel.GRADE_12
      ) {
        gradeLevel = GradeLevel.GRADE_12;
      }
    } else if (program === Program.HOMESCHOOL_COTTAGE) {
      if (
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
      }
    }

    return (
      fee.accreditation === accreditation &&
      fee.gradeLevel === gradeLevel &&
      fee.program === program &&
      fee.type === enrollmentType
    );
  });

  const goToStep = (step) => setStep(step);

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      toggleReview();
    }
  };

  const previous = () => setStep(step - 1);

  const submit = () => {
    setSubmittingState(true);
    api('/api/enroll', {
      body: {
        firstName,
        middleName,
        lastName,
        gender,
        religion,
        reason,
        enrollmentType,
        incomingGradeLevel,
        formerSchoolName,
        formerSchoolAddress,
        program,
        accreditation,
        payment,
        birthDate,
        slug: workspace.slug,
      },
      method: 'POST',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        setViewFees(true);
        toast.success('Student information successfully submitted!');
      }
    });
  };

  const toggleReview = () => setReviewVisibility(!review);

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
              placeholder="Middle Name (Optional)"
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
                  incomingGradeLevel !== GradeLevel.PRESCHOOL &&
                  incomingGradeLevel !== GradeLevel.K1
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
          <h3 className="text-sm font-bold">
            Student's Duties and Expectations
          </h3>
          <p>We understand that:</p>
          <ol className="px-5 list-decimal">
            <li>
              The student is required and expected to join the Bi Annual
              portfolio presentation and other coop class/meet ups when the
              health and safety of students are no longer at risk due to COVID.
              Students outside Cebu City is expected to join the virtually.
            </li>
            <li>
              The student (residing in Cebu/Cebu City) is required to
              participate in every Commencement Exercises (only when COVID
              pandemic is already flattened and the Government declares it is
              now safe to do so) organized by the school with corresponding
              fees. Graduation fees are non-refundable.
            </li>
            <li>
              In instances wherein a student is directly negligent with his
              academic responsibilities, an immediate conference with the
              child’s parents will be secured. It is the responsibility of the
              parent to attend to this meeting so that an immediate solution to
              the challenge will be agreed upon.
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
        <label className="text-lg font-bold" htmlFor="txtMother">
          Select Payment Type <span className="ml-1 text-red-600">*</span>
        </label>
        <div className="relative flex flex-row space-x-5">
          <div
            className={`flex flex-row items-center justify-between w-full px-5 py-3 hover:shadow-lg ${
              payment === PaymentType.ANNUAL
                ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                : 'border rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
            }`}
            onClick={() => {
              setPayment(PaymentType.ANNUAL);
              setFee(schoolFee?.fees[0]);
            }}
          >
            {payment === PaymentType.ANNUAL && (
              <div className="absolute flex items-center justify-center w-8 h-8 text-white rounded-full -right-3 -top-3 bg-primary-200">
                <CheckIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold">Full Payment</h3>
              <div>
                <span>
                  Initial Payment:{' '}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(schoolFee?.fees[0]?.totalFee || 0)}
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold">
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'PHP',
                }).format(schoolFee?.fees[0]?.totalFee || 0)}
              </span>
            </h3>
          </div>
        </div>
        <div className="relative flex flex-row space-x-5">
          <div
            className={`flex flex-row items-center justify-between w-full px-5 py-3 hover:shadow-lg ${
              payment === PaymentType.SEMI_ANNUAL
                ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                : 'border rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
            }`}
            onClick={() => {
              setPayment(PaymentType.SEMI_ANNUAL);
              setFee(schoolFee?.fees[1]);
            }}
          >
            {payment === PaymentType.SEMI_ANNUAL && (
              <div className="absolute flex items-center justify-center w-8 h-8 text-white rounded-full -right-3 -top-3 bg-primary-200">
                <CheckIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold">Semi Annual</h3>
              <div>
                <span>
                  Initial Fee:{' '}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(schoolFee?.fees[1]?.initialFee || 0)}{' '}
                  +
                </span>
                <span>
                  (
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(schoolFee?.fees[1]?.semiAnnualFee || 0)}{' '}
                  semi-annually)
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP',
              }).format(
                schoolFee?.fees[1]?.initialFee +
                  schoolFee?.fees[1]?.semiAnnualFee * 2 || 0
              )}
            </h3>
          </div>
        </div>
        <div className="relative flex flex-row space-x-5">
          <div
            className={`flex flex-row items-center justify-between w-full px-5 py-3 hover:shadow-lg ${
              payment === PaymentType.QUARTERLY
                ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                : 'border rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
            }`}
            onClick={() => {
              setPayment(PaymentType.QUARTERLY);
              setFee(schoolFee?.fees[2]);
            }}
          >
            {payment === PaymentType.QUARTERLY && (
              <div className="absolute flex items-center justify-center w-8 h-8 text-white rounded-full -right-3 -top-3 bg-primary-200">
                <CheckIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold">Quarterly</h3>
              <div>
                <span>
                  Initial Fee:{' '}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(schoolFee?.fees[2]?.initialFee || 0)}{' '}
                  +
                </span>
                <span>
                  (
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(schoolFee?.fees[2]?.quarterlyFee || 0)}{' '}
                  quarterly)
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP',
              }).format(
                schoolFee?.fees[2]?.initialFee +
                  schoolFee?.fees[2]?.quarterlyFee * 3 || 0
              )}
            </h3>
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
        <div>
          <p>
            By completing and submitting this form, I understand that I am
            applying to be a part of Living Pupil Homeschool for SY
            {new Date().getFullYear()} - {new Date().getFullYear() + 1}. I have
            thoroughly reviewed the forms, and I agree with everything
            stipulated in the student form. I agree to the rates as indicated
            for this enrollment period. Lastly, I understand that this agreement
            is absolute and will be enforced.
          </p>
          <label className="flex items-center mt-10 space-x-3 font-medium cursor-pointer">
            <input
              checked={agree}
              type="checkbox"
              onChange={() => setAgree(!agree)}
            />
            <span>
              Yes, I agree. My responses will be saved in Living Pupil
              Homeschool's Database
            </span>
          </label>
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
        {!workspace.studentRecord ? (
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
                  disabled={!validateNext}
                  onClick={next}
                >
                  {step === steps.length - 1 ? 'Proceed' : 'Next'}
                </Button>
              </Card.Footer>
            </Card>
          </Content.Container>
        ) : (
          <Content.Container>
            <Card>
              <Card.Body
                title="Student Record Information"
                // subtitle={`Last Updated: ${workspace.studentRecord.updatedAt}`}
              >
                <div className="flex flex-row items-center py-5 space-x-10">
                  <div className="flex items-center justify-center w-32 h-32 text-white bg-gray-400 rounded-full">
                    <UserIcon className="w-20 h-20" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-4xl font-medium">
                      {workspace.studentRecord.firstName}{' '}
                      {workspace.studentRecord.middleName}{' '}
                      {workspace.studentRecord.lastName}
                    </h2>
                    <div>
                      <h3 className="text-sm text-gray-400">
                        <span className="font-bold">Student Record ID: </span>
                        <span>
                          {workspace.studentRecord.studentId.toUpperCase()}
                        </span>
                      </h3>
                    </div>
                  </div>
                </div>
                <hr className="border-dashed" />
                <div className="flex flex-row space-x-10">
                  <div className="w-1/2 space-y-10">
                    <div>
                      <h4 className="font-bold text-gray-600">
                        Program and Accreditation
                      </h4>
                      <p className="text-2xl">
                        {PROGRAM[workspace.studentRecord.program]} -{' '}
                        {ACCREDITATION[workspace.studentRecord.accreditation]}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-600">Birth Date</h4>
                      <p className="text-2xl">
                        {format(
                          new Date(workspace.studentRecord.birthDate),
                          'MMMM dd, yyyy'
                        )}{' '}
                        (
                        {differenceInCalendarYears(
                          new Date(),
                          workspace.studentRecord.birthDate
                        )}
                        )
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-600">Former School</h4>
                      <p className="text-2xl capitalize">
                        {workspace.studentRecord.formerSchoolName}
                      </p>
                      <p className="text-lg">
                        {workspace.studentRecord.formerSchoolAddress}
                      </p>
                    </div>
                  </div>
                  <div className="w-1/2 space-y-10">
                    <div>
                      <h4 className="font-bold text-gray-600">Grade Level</h4>
                      <p className="text-2xl">
                        {
                          GRADE_LEVEL[
                            workspace.studentRecord.incomingGradeLevel
                          ]
                        }
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-600">Gender</h4>
                      <p className="text-2xl capitalize">
                        {workspace.studentRecord.gender.toLowerCase()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-600">Religion</h4>
                      <p className="text-2xl capitalize">
                        {RELIGION[workspace.studentRecord.religion]}
                      </p>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Content.Container>
        )}
        <Modal
          show={review}
          toggle={toggleReview}
          title="Review LPHS Enrollment Details"
        >
          <h3 className="text-lg font-bold">
            Student Information -{' '}
            <span className="text-primary-500">
              {ENROLLMENT_TYPE[enrollmentType]}
            </span>
          </h3>
          <div className="px-3 text-sm">
            <p>
              <strong>Name:</strong> {lastName}, {firstName} {middleName}
            </p>
            <p className="capitalize">
              <strong>Incoming Grade Level:</strong>{' '}
              {GRADE_LEVEL[incomingGradeLevel].toLowerCase()}
            </p>
            <p>
              <strong>Birth Date:</strong> {birthDate?.toDateString() || 0} (
              {age} years old)
            </p>
            <p className="capitalize">
              <strong>Gender:</strong> {gender.toLowerCase()}
            </p>
            <p className="capitalize">
              <strong>Religion:</strong> {RELIGION[religion].toLowerCase()}
            </p>
            <p className="capitalize">
              <strong>Reason for homeschooling:</strong> {reason}
            </p>
            <p>
              <strong>Former School:</strong> {formerSchoolName} (
              {formerSchoolAddress})
            </p>
          </div>
          <h3 className="text-lg font-bold">
            {PROGRAM[program]} for {GRADE_LEVEL[incomingGradeLevel]} -{' '}
            {ACCREDITATION[accreditation]} Fees
          </h3>
          <div className="px-3 text-sm">
            <div>
              <p>
                <strong>Payment Breakdown</strong>
              </p>
              <table className="w-full my-5 border ">
                <tbody>
                  <tr>
                    <td className="px-3 py-1 border">
                      {fee?._type === 'annual' ? 'Total Fee' : 'Initial Fee'}
                    </td>
                    <td className="px-3 py-1 text-right border">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(
                        fee?._type === 'annual'
                          ? fee?.totalFee
                          : fee?.initialFee
                      )}
                    </td>
                  </tr>
                  {Array.from(
                    Array(
                      fee?._type === 'annual'
                        ? 0
                        : fee?._type === 'semiAnnual'
                        ? 2
                        : 3
                    ),
                    (_, index) => (
                      <tr key={index}>
                        <td className="px-3 py-1 border">
                          {fee?._type === 'annual'
                            ? ''
                            : fee?._type === 'semiAnnual'
                            ? `Semi Annual Payment #${index + 1}`
                            : `Quarterly Payment #${index + 1}`}
                        </td>
                        <td className="px-3 py-1 text-right border">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'PHP',
                          }).format(
                            fee?._type === 'annual'
                              ? 0
                              : fee?._type === 'semiAnnual'
                              ? fee?.semiAnnualFee
                              : fee?.quarterlyFee
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
            <h4 className="text-lg font-bold">
              Total School Fees:{' '}
              <span className="text-primary-500">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'PHP',
                }).format(
                  (fee?._type === 'annual' ? fee?.totalFee : fee?.initialFee) +
                    (fee?._type === 'annual'
                      ? 0
                      : fee?._type === 'semiAnnual'
                      ? fee?.semiAnnualFee
                      : fee?.quarterlyFee *
                        (fee?._type === 'annual'
                          ? 1
                          : fee?._type === 'semiAnnual'
                          ? 2
                          : 3)) || 0
                )}
              </span>
            </h4>
          </div>
          {viewFees ? (
            <Link href={`/account/${workspace.slug}/fees`}>
              <a className="inline-block w-full py-2 text-center text-white rounded bg-primary-500 hover:bg-primary-400 disabled:opacity-50">
                Pay School Fees
              </a>
            </Link>
          ) : (
            <button
              className="w-full py-2 text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-50"
              disabled={isSubmitting}
              onClick={submit}
            >
              {isSubmitting ? 'Processing...' : 'Submit'}
            </button>
          )}
        </Modal>
      </AccountLayout>
    )
  );
};

export const getServerSideProps = async () => {
  const schoolFees = await sanityClient.fetch(`*[_type == 'schoolFees']{...}`);
  return { props: { schoolFees } };
};

export default Workspace;
