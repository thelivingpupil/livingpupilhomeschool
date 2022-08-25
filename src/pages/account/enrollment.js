import { useState } from 'react';
import {
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/solid';
import {
  Accreditation,
  Enrollment,
  Fees,
  Gender,
  GradeLevel,
  PaymentType,
  Program,
  Religion,
} from '@prisma/client';
import crypto from 'crypto';
import differenceInCalendarYears from 'date-fns/differenceInCalendarYears';
import format from 'date-fns/format';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import slugify from 'slugify';

import Button from '@/components/Button';
import Card from '@/components/Card';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import Modal from '@/components/Modal';
import { AccountLayout } from '@/layouts/index';
import { storage } from '@/lib/client/firebase';
import api from '@/lib/common/api';
import sanityClient from '@/lib/server/sanity';
import {
  ACCREDITATION,
  ENROLLMENT_TYPE,
  FEES,
  GRADE_LEVEL,
  GRADE_LEVEL_GROUPS,
  PAYMENT_TYPE,
  PROGRAM,
  RELIGION,
} from '@/utils/constants';

const steps = [
  'Student Information',
  'Program and Accreditation',
  'School Fees',
];

const EnrollmentProcess = ({ schoolFees }) => {
  const [step, setStep] = useState(0);
  const [viewFees, setViewFees] = useState(false);
  const [isSubmitting, setSubmittingState] = useState(false);
  const [review, setReviewVisibility] = useState(false);
  const [agree, setAgree] = useState(false);
  const [slug, setSlug] = useState('');
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
  const [paymentMethod, setPaymentMethod] = useState(null);

  const [pictureProgress, setPictureProgress] = useState(0);
  const [birthCertificateProgress, setBirthCertificateProgress] = useState(0);
  const [reportCardProgress, setReportCardProgress] = useState(0);
  const [pictureLink, setPictureLink] = useState(null);
  const [birthCertificateLink, setBirthCertificateLink] = useState(null);
  const [reportCardLink, setReportCardLink] = useState(null);

  const age = differenceInCalendarYears(new Date(), birthDate) || 0;
  const validateNext =
    (step === 0 &&
      firstName.length > 0 &&
      lastName.length > 0 &&
      reason.length > 0 &&
      formerSchoolName.length > 0 &&
      formerSchoolAddress.length > 0) ||
    (step === 1 && accreditation !== null) ||
    (step === 2 && payment !== null && paymentMethod && agree);
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
    }

    return (
      fee.accreditation === accreditation &&
      fee.gradeLevel === gradeLevel &&
      fee.program === program &&
      fee.type === enrollmentType
    );
  });

  const goToStep = (step) => {
    validateNext && setStep(step);
    document.getElementById('scroller').scroll(0, 0);
  };

  const handlePictureUpload = (e, auto, studentId) => {
    const file = e.target?.files[0];

    if (file) {
      // 510MB
      if (file.size < 10485760) {
        const extension = file.name.split('.').pop();
        const storageRef = ref(
          storage,
          `files/${slug}/picture-${crypto
            .createHash('md5')
            .update(file.name)
            .digest('hex')
            .substring(0, 12)}-${format(
            new Date(),
            'yyyy.MM.dd.kk.mm.ss'
          )}.${extension}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setPictureProgress(progress);
          },
          (error) => {
            toast.error(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              if (!auto) {
                setPictureLink(downloadURL);
              } else {
                updateFile(studentId, 'image', downloadURL);
              }
            });
          }
        );
      }
    } else {
      toast.error('File too large. Size should not exceed 10 MB.');
    }
  };

  const handleBirthCertificateUpload = (e, auto, studentId) => {
    const file = e.target?.files[0];

    if (file) {
      if (file.size < 5242880) {
        const extension = file.name.split('.').pop();
        const storageRef = ref(
          storage,
          `files/${slug}/birth-${crypto
            .createHash('md5')
            .update(file.name)
            .digest('hex')
            .substring(0, 12)}-${format(
            new Date(),
            'yyyy.MM.dd.kk.mm.ss'
          )}.${extension}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setBirthCertificateProgress(progress);
          },
          (error) => {
            toast.error(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              if (!auto) {
                setBirthCertificateLink(downloadURL);
              } else {
                updateFile(studentId, 'birth', downloadURL);
              }
            });
          }
        );
      }
    } else {
      toast.error('File too large. Size should not exceed 10 MB.');
    }
  };

  const handleReportCardUpload = (e, auto, studentId) => {
    const file = e.target?.files[0];

    if (file) {
      // 10 MB
      if (file.size < 10485760) {
        const extension = file.name.split('.').pop();
        const storageRef = ref(
          storage,
          `files/${slug}/birth-${crypto
            .createHash('md5')
            .update(file.name)
            .digest('hex')
            .substring(0, 12)}-${format(
            new Date(),
            'yyyy.MM.dd.kk.mm.ss'
          )}.${extension}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setReportCardProgress(progress);
          },
          (error) => {
            toast.error(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              if (!auto) {
                setReportCardLink(downloadURL);
              } else {
                updateFile(studentId, 'card', downloadURL);
              }
            });
          }
        );
      }
    } else {
      toast.error('File too large. Size should not exceed 10 MB.');
    }
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      document.getElementById('scroller').scroll(0, 0);
    } else {
      toggleReview();
    }
  };

  const previous = () => {
    setStep(step - 1);
    document.getElementById('scroller').scroll(0, 0);
  };

  const submit = () => {
    schoolFee;
    setSubmittingState(true);
    api('/api/enroll/direct', {
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
        pictureLink,
        birthCertificateLink,
        reportCardLink,
        paymentMethod,
        slug,
      },
      method: 'POST',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        window.open(response.data.schoolFee.url, '_blank');
        setViewFees(true);
        toast.success('Student information successfully submitted!');
      }
    });
  };

  const toggleReview = () => setReviewVisibility(!review);

  const updateFile = (studentId, type, url) => {
    api('/api/students/files', {
      body: {
        studentId,
        type,
        url,
      },
      method: 'PUT',
    }).then((response) => {
      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        switch (type) {
          case 'image': {
            setPictureLink(url);
            break;
          }
          case 'birth': {
            setBirthCertificateLink(url);
            break;
          }
          case 'card': {
            setReportCardLink(url);
            break;
          }
        }

        toast.success('File uploaded successfully!');
      }
    });
  };

  const renderTab = () => {
    const tabs = [
      renderPersonalInformation,
      renderCurriculum,
      renderSchoolFees,
    ];
    return tabs[step]();
  };

  const renderPersonalInformation = () => {
    return (
      <>
        <div className="flex flex-col p-5 space-y-3 overflow-auto">
          <div className="flex flex-col">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Full Name <span className="ml-1 text-red-600">*</span>
            </label>
            <div className="flex flex-col space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
              <input
                className="px-3 py-2 border rounded md:w-1/3"
                onChange={(e) => {
                  let firstName = e.target.value;
                  setFirstName(firstName);
                  setSlug(
                    slugify(
                      `${firstName.toLowerCase()} ${lastName.toLowerCase()} ${crypto
                        .createHash('md5')
                        .update(`${firstName} ${lastName}`)
                        .digest('hex')
                        .substring(0, 6)}}`
                    )
                  );
                }}
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
                onChange={(e) => {
                  let lastName = e.target.value;
                  setLastName(lastName);
                  setSlug(
                    slugify(
                      `${firstName.toLowerCase()} ${lastName.toLowerCase()} ${crypto
                        .createHash('md5')
                        .update(`${firstName} ${lastName}`)
                        .digest('hex')
                        .substring(0, 6)}}`
                    )
                  );
                }}
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
          <div className="flex flex-col space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
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
        <Card.Body title="Files and Documents">{renderFileUpload()}</Card.Body>
        <Card.Body title="Educational Background">
          {renderEducationalBackground()}
        </Card.Body>
      </>
    );
  };

  const renderFileUpload = () => {
    return (
      <div className="flex flex-col p-5 space-y-5 overflow-auto">
        {(!firstName || !lastName) && (
          <div className="px-3 py-3 text-sm border-2 rounded text-amber-500 border-amber-600 bg-amber-50">
            <p>
              Please provide the student information first before uploading any
              documents
            </p>
          </div>
        )}
        <label className="text-lg font-bold" htmlFor="txtMother">
          Optional: You can upload these files at a later time
        </label>
        <p className="text-sm text-gray-600">
          Accepted file formats are <strong>PDF</strong>, <strong>PNG</strong>,
          <strong>JPEG/JPG</strong>, and <strong>GIF</strong> with a maximum
          file size of <strong className="text-red-600">10 MB</strong>.
        </p>
        <table className="table border border-collapse">
          <tbody>
            <tr>
              <td className="w-1/2 px-3 py-2 border">
                <h3 className="text-xl font-medium">ID Picture</h3>
                <p className="text-sm text-gray-400">
                  Digital copy of the child's latest photo with{' '}
                  <strong>WHITE</strong> background
                </p>
              </td>
              <td className="w-1/4 px-3 py-2 border">
                <input
                  className="text-xs cursor-pointer"
                  accept=".jpeg,.jpg,.png"
                  disabled={!firstName || !lastName}
                  onChange={handlePictureUpload}
                  type="file"
                />
                <div className="w-full mt-2 rounded-full shadow bg-grey-light">
                  <div
                    className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
                    style={{ width: `${pictureProgress}%` }}
                  >
                    <span className="px-3">{pictureProgress}%</span>
                  </div>
                </div>
              </td>
              <td className="w-1/4 px-3 py-2 border">
                <div className="flex flex-col items-center justify-center space-y-3">
                  {pictureLink ? (
                    <Link href={pictureLink}>
                      <a
                        className="text-sm text-blue-600 underline"
                        target="_blank"
                      >
                        Preview Image
                      </a>
                    </Link>
                  ) : (
                    <p>No file selected</p>
                  )}
                </div>
              </td>
            </tr>
            <tr>
              <td className="w-1/2 px-3 py-2 border">
                <h3 className="text-xl font-medium">Birth Certificate</h3>
                <p className="text-sm text-gray-400">
                  <strong>Philippine Statistics Authority (PSA)</strong> issued
                  copy of the child's birth certificate
                </p>
              </td>
              <td className="w-1/4 px-3 py-2 border">
                <input
                  className="text-xs cursor-pointer"
                  accept=".gif,.jpeg,.jpg,.png,.pdf"
                  disabled={!firstName || !lastName}
                  onChange={handleBirthCertificateUpload}
                  type="file"
                />
                <div className="w-full mt-2 rounded-full shadow bg-grey-light">
                  <div
                    className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
                    style={{ width: `${birthCertificateProgress}%` }}
                  >
                    <span className="px-3">{birthCertificateProgress}%</span>
                  </div>
                </div>
              </td>
              <td className="w-1/4 px-3 py-2 border">
                <div className="flex flex-col items-center justify-center">
                  {birthCertificateLink ? (
                    <Link href={birthCertificateLink}>
                      <a
                        className="text-sm text-blue-600 underline"
                        target="_blank"
                      >
                        Preview Document
                      </a>
                    </Link>
                  ) : (
                    <p>No file selected</p>
                  )}
                </div>
              </td>
            </tr>
            <tr>
              <td className="w-1/2 px-3 py-2 border">
                <h3 className="text-xl font-medium">
                  Report Card / School Card
                </h3>
                <p className="text-sm text-gray-400">
                  Copy of the child's report card or school card from the
                  previous school
                </p>
              </td>
              <td className="w-1/4 px-3 py-2 border">
                <input
                  className="text-xs cursor-pointer"
                  accept=".gif,.jpeg,.jpg,.png,.pdf"
                  disabled={!firstName || !lastName}
                  onChange={handleReportCardUpload}
                  type="file"
                />
                <div className="w-full mt-2 rounded-full shadow bg-grey-light">
                  <div
                    className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
                    style={{ width: `${reportCardProgress}%` }}
                  >
                    <span className="px-3">{reportCardProgress}%</span>
                  </div>
                </div>
              </td>
              <td className="w-1/4 px-3 py-2 border">
                <div className="flex flex-col items-center justify-center">
                  {reportCardLink ? (
                    <Link href={reportCardLink}>
                      <a
                        className="text-sm text-blue-600 underline"
                        target="_blank"
                      >
                        Preview Document
                      </a>
                    </Link>
                  ) : (
                    <p>No file selected</p>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderEducationalBackground = () => {
    return (
      <div className="flex flex-col p-5 space-y-5 overflow-auto">
        <label className="text-lg font-bold" htmlFor="txtMother">
          Enrolling as a <span className="ml-1 text-red-600">*</span>
        </label>
        <div className="flex flex-row">
          <div className="relative inline-block w-full border rounded">
            <select
              className="w-full px-3 py-2 capitalize rounded appearance-none"
              onChange={(e) => setEnrollmentType(e.target.value)}
              value={enrollmentType}
            >
              {Object.keys(ENROLLMENT_TYPE).map((entry, index) => (
                <option key={index} value={entry}>
                  {ENROLLMENT_TYPE[entry].toLowerCase()}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDownIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
        {/* <div className="flex flex-col space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
          <div
            className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/2 border-2 border-primary-200 ${
              enrollmentType === Enrollment.NEW
                ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                : 'border border-dashed rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
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
            className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/2 border-2 border-primary-200 ${
              enrollmentType === Enrollment.CONTINUING
                ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                : 'border border-dashed rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
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
        </div> */}
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
                  onChange={(e) => {
                    setIncomingGradeLevel(e.target.value);
                    setAccreditation(null);
                  }}
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
        <label className="text-lg font-bold" htmlFor="txtMother">
          Select a Program <span className="ml-1 text-red-600">*</span>
        </label>
        <div className="flex flex-col space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
          <div
            className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/2 border-2 border-primary-200 ${
              program === Program.HOMESCHOOL_PROGRAM
                ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                : 'border border-dashed rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
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
            className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/2 border-2 border-primary-200 ${
              incomingGradeLevel === GradeLevel.K2 ||
              incomingGradeLevel === GradeLevel.GRADE_1 ||
              incomingGradeLevel === GradeLevel.GRADE_2 ||
              incomingGradeLevel === GradeLevel.GRADE_3 ||
              incomingGradeLevel === GradeLevel.GRADE_4 ||
              incomingGradeLevel === GradeLevel.GRADE_5 ||
              incomingGradeLevel === GradeLevel.GRADE_6 ||
              incomingGradeLevel === GradeLevel.GRADE_7 ||
              incomingGradeLevel === GradeLevel.GRADE_8 ||
              incomingGradeLevel === GradeLevel.GRADE_9 ||
              incomingGradeLevel === GradeLevel.GRADE_10
                ? program === Program.HOMESCHOOL_COTTAGE
                  ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                  : 'border border-dashed rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
                : 'bg-gray-300 opacity-50 rounded'
            }`}
            onClick={() => {
              if (
                incomingGradeLevel === GradeLevel.K2 ||
                incomingGradeLevel === GradeLevel.GRADE_1 ||
                incomingGradeLevel === GradeLevel.GRADE_2 ||
                incomingGradeLevel === GradeLevel.GRADE_3 ||
                incomingGradeLevel === GradeLevel.GRADE_4 ||
                incomingGradeLevel === GradeLevel.GRADE_5 ||
                incomingGradeLevel === GradeLevel.GRADE_6 ||
                incomingGradeLevel === GradeLevel.GRADE_7 ||
                incomingGradeLevel === GradeLevel.GRADE_8 ||
                incomingGradeLevel === GradeLevel.GRADE_9 ||
                incomingGradeLevel === GradeLevel.GRADE_10
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
        <label className="text-lg font-bold" htmlFor="txtMother">
          Select an Accreditation <span className="ml-1 text-red-600">*</span>
        </label>
        <div className="flex flex-col space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
          {program === Program.HOMESCHOOL_PROGRAM && (
            <>
              <div
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/3 border-2 border-primary-200 ${
                  accreditation === Accreditation.LOCAL
                    ? 'border-4 border-solid rounded-xl border-primary-200 bg-primary-50/50'
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
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/3 border-2 border-primary-200 ${
                  incomingGradeLevel !== GradeLevel.PRESCHOOL &&
                  incomingGradeLevel !== GradeLevel.K1
                    ? accreditation === Accreditation.INTERNATIONAL
                      ? 'border-4 border-solid rounded-xl border-primary-200 bg-primary-50/50'
                      : 'border border-dashed rounded cursor-pointer hover:border-primary-200 hover:bg-primary-50/25'
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
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/3 border-2 border-primary-200 ${
                  incomingGradeLevel !== GradeLevel.PRESCHOOL &&
                  incomingGradeLevel !== GradeLevel.K1
                    ? accreditation === Accreditation.DUAL
                      ? 'border-4 border-solid rounded-xl border-primary-200 bg-primary-50/50'
                      : 'border border-dashed rounded cursor-pointer hover:border-primary-200 hover:bg-primary-50/25'
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
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/4 border-2 border-primary-200 ${
                  incomingGradeLevel === GradeLevel.K2
                    ? accreditation === Accreditation.LOCAL
                      ? 'border-4 rounded-xl border-primary-200 bg-primary-50/50'
                      : 'border border-dashed rounded cursor-pointer hover:border-primary-200 hover:bg-primary-50/25'
                    : 'bg-gray-300 opacity-50 rounded'
                }`}
                onClick={() => {
                  if (incomingGradeLevel === GradeLevel.K2) {
                    setAccreditation(Accreditation.LOCAL);
                  }
                }}
              >
                {accreditation === Accreditation.LOCAL && (
                  <div className="absolute flex items-center justify-center w-8 h-8 text-white rounded-full -right-3 -top-3 bg-primary-200">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                )}
                <h3 className="flex flex-col font-medium text-center">
                  <span className="text-lg">Local</span>
                  <span className="text-sm">(K2)</span>
                </h3>
              </div>
              <div
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/4 border-2 border-primary-200 ${
                  incomingGradeLevel === GradeLevel.GRADE_1 ||
                  incomingGradeLevel === GradeLevel.GRADE_2 ||
                  incomingGradeLevel === GradeLevel.GRADE_3
                    ? accreditation === Accreditation.FORM_ONE
                      ? 'border-4 rounded-xl border-primary-200 bg-primary-50/50'
                      : 'border border-dashed rounded cursor-pointer hover:border-primary-200 hover:bg-primary-50/25'
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
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/4 border-2 border-primary-200 ${
                  incomingGradeLevel === GradeLevel.GRADE_4 ||
                  incomingGradeLevel === GradeLevel.GRADE_5 ||
                  incomingGradeLevel === GradeLevel.GRADE_6
                    ? accreditation === Accreditation.FORM_TWO
                      ? 'border-4 rounded-xl border-primary-200 bg-primary-50/50'
                      : 'border border-dashed rounded cursor-pointer hover:border-primary-200 hover:bg-primary-50/25'
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
              <div
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/4 border-2 border-primary-200 ${
                  incomingGradeLevel === GradeLevel.GRADE_7 ||
                  incomingGradeLevel === GradeLevel.GRADE_8 ||
                  incomingGradeLevel === GradeLevel.GRADE_9 ||
                  incomingGradeLevel === GradeLevel.GRADE_10
                    ? accreditation === Accreditation.FORM_THREE
                      ? 'border-4 rounded-xl border-primary-200 bg-primary-50/50'
                      : 'border border-dashed rounded cursor-pointer hover:border-primary-200 hover:bg-primary-50/25'
                    : 'bg-gray-300 opacity-50 rounded'
                }`}
                onClick={() => {
                  if (
                    incomingGradeLevel === GradeLevel.GRADE_7 ||
                    incomingGradeLevel === GradeLevel.GRADE_8 ||
                    incomingGradeLevel === GradeLevel.GRADE_9 ||
                    incomingGradeLevel === GradeLevel.GRADE_10
                  ) {
                    setAccreditation(Accreditation.FORM_THREE);
                  }
                }}
              >
                {accreditation === Accreditation.FORM_THREE && (
                  <div className="absolute flex items-center justify-center w-8 h-8 text-white rounded-full -right-3 -top-3 bg-primary-200">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                )}
                <h3 className="flex flex-col font-medium text-center">
                  <span className="text-lg">Form 3</span>
                  <span className="text-sm">(Grades 7 - 10)</span>
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
            className={`flex flex-col md:flex-row space-y-5 md:space-y-0 md:items-center md:justify-between w-full px-5 py-3 hover:shadow-lg border-2 border-primary-200 ${
              payment === PaymentType.ANNUAL
                ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                : 'border border-dashed rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
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
            className={`flex flex-col md:flex-row space-y-5 md:space-y-0 md:items-center md:justify-between w-full px-5 py-3 hover:shadow-lg border-2 border-primary-200 ${
              payment === PaymentType.SEMI_ANNUAL
                ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                : 'border border-dashed rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
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
            className={`flex flex-col md:flex-row space-y-5 md:space-y-0 md:items-center md:justify-between w-full px-5 py-3 hover:shadow-lg border-2 border-primary-200 ${
              payment === PaymentType.QUARTERLY
                ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                : 'border border-dashed rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
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
                  }).format(
                    Number(schoolFee?.fees[2]?.quarterlyFee).toFixed(0) || 0
                  )}{' '}
                  quarterly)
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP',
              }).format(
                Number(
                  schoolFee?.fees[2]?.initialFee +
                    schoolFee?.fees[2]?.quarterlyFee * 3
                ).toFixed(0) || 0
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
          <hr className="my-5 border border-dashed" />
          <div className="flex flex-col mt-5 space-x-0 space-y-5 md:flex-row md:justify-between md:space-x-5 md:space-y-0">
            <div className="space-y-3 md:w-1/2">
              <label className="text-lg font-bold" htmlFor="txtMother">
                Select Payment Method
                <span className="ml-1 text-red-600">*</span>
              </label>
              <div
                className={`flex items-center px-5 py-5 space-x-3 text-gray-600 bg-gray-100 rounded cursor-pointer ${
                  paymentMethod === Fees.ONLINE
                    ? 'border-green-600 text-green-500 border-2'
                    : 'border'
                }`}
                onClick={() => setPaymentMethod(Fees.ONLINE)}
              >
                {paymentMethod === Fees.ONLINE ? (
                  <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
                ) : (
                  <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                )}
                <span>Online Banking (+ Php 10.00)</span>
              </div>
              <div
                className={`flex items-center px-5 py-5 space-x-3 text-gray-600 bg-gray-100 rounded cursor-pointer ${
                  paymentMethod === Fees.OTC
                    ? 'border-green-600 text-green-500 border-2'
                    : 'border'
                }`}
                onClick={() => setPaymentMethod(Fees.OTC)}
              >
                {paymentMethod === Fees.OTC ? (
                  <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
                ) : (
                  <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                )}
                <span>Over-the-Counter Banking (+ Php 15.00)</span>
              </div>
              <div
                className={`flex items-center px-5 py-5 space-x-3 text-gray-600 bg-gray-100 rounded cursor-pointer ${
                  paymentMethod === Fees.PAYMENT_CENTERS
                    ? 'border-green-600 text-green-500 border-2'
                    : 'border'
                }`}
                onClick={() => setPaymentMethod(Fees.PAYMENT_CENTERS)}
              >
                {paymentMethod === Fees.PAYMENT_CENTERS ? (
                  <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
                ) : (
                  <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                )}
                <span>Payment Centers (+ Php 20.00)</span>
              </div>
            </div>
            <div className="flex flex-col space-y-3 md:w-1/2">
              <label
                className="text-lg font-medium text-primary-300"
                htmlFor="txtMother"
              >
                {payment === PaymentType.ANNUAL
                  ? 'Full Payment'
                  : 'Initial Fees'}{' '}
                Summary for <span className="">{PAYMENT_TYPE[payment]}</span>{' '}
                Payments
              </label>
              <div className="flex flex-col justify-between border rounded bg-gray-50">
                <div className="flex items-center justify-between p-5 space-x-5 border-b">
                  <div>
                    <h5 className="font-medium">Enrollment Fee</h5>
                    <h6 className="text-xs text-gray-400">
                      Based on payment type selection
                    </h6>
                  </div>
                  <div className="text-right">
                    <span>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(
                        (fee?._type === 'annual'
                          ? fee?.totalFee
                          : fee?.initialFee) || 0
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-5 space-x-5">
                  <div>
                    <h5 className="font-medium">Payment Gateway Fee</h5>
                    <h6 className="text-xs text-gray-400">
                      Based on payment method selection
                    </h6>
                  </div>
                  <div className="text-right">
                    <span>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(FEES[paymentMethod] || 0)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between p-5 space-x-5 bg-gray-100 border-t border-dashed">
                  <div>
                    <h5 className="font-bold">Total Payable</h5>
                    <h6 className="text-xs text-primary-500">
                      <strong>NOTE</strong>: Succeeding payments will always
                      incur payment gateway fees per transaction
                    </h6>
                  </div>
                  <div className="text-right">
                    <span>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(
                        (fee?._type === 'annual'
                          ? fee?.totalFee
                          : fee?.initialFee) + FEES[paymentMethod] || 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
    <AccountLayout>
      <Meta title={`Living Pupil Homeschool - Student Enrollment Form`} />
      <Content.Title
        title="Student Enrollment Form"
        subtitle="This is the student enrollment form"
      />
      <Content.Divider />
      <Content.Container>
        <div className="flex justify-between w-full md:flex-wrap md:space-x-5">
          {steps.map((name, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center w-1/3 space-y-3 cursor-pointer md:w-auto"
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
              <span className="text-xs text-center">{name}</span>
            </div>
          ))}
        </div>
        <div className="px-3 py-3 text-sm text-blue-500 border-2 border-blue-600 rounded bg-blue-50">
          <p>
            All fields marked with an{' '}
            <span className="font-bold text-red-600">*</span> are{' '}
            <strong>required</strong>
          </p>
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
      <Modal
        show={review}
        toggle={toggleReview}
        title="Review LPHS Enrollment Details"
      >
        <div className="flex items-center px-3 py-3 space-x-3 text-sm text-red-500 border-2 border-red-600 rounded bg-red-50">
          <div className="w-5 h-5">
            <InformationCircleIcon />
          </div>
          <p>
            Please make sure that all information and documents submitted are
            correct before proceeding to pay the application fee.
          </p>
        </div>
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
            <strong>Birth Date:</strong> {birthDate?.toDateString() || 0} ({age}{' '}
            years old)
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
          <div>
            <strong>ID Picture:</strong>{' '}
            {pictureLink ? (
              <Link href={pictureLink}>
                <a className="text-blue-600 underline" target="_blank">
                  Link Preview
                </a>
              </Link>
            ) : (
              'N/A'
            )}
          </div>
          <div>
            <strong>Birth Certificate:</strong>{' '}
            {birthCertificateLink ? (
              <Link href={birthCertificateLink}>
                <a className="text-blue-600 underline" target="_blank">
                  Link Preview
                </a>
              </Link>
            ) : (
              'N/A'
            )}
          </div>
          <div>
            <strong>Report Card:</strong>{' '}
            {reportCardLink ? (
              <Link href={reportCardLink}>
                <a className="text-blue-600 underline" target="_blank">
                  Link Preview
                </a>
              </Link>
            ) : (
              'N/A'
            )}
          </div>
        </div>
        <h3 className="text-lg font-bold">
          {PROGRAM[program]} for {GRADE_LEVEL[incomingGradeLevel]} -{' '}
          {ACCREDITATION[accreditation]} Fees
        </h3>
        <div className="px-3 text-sm">
          <div>
            <p>
              <strong>School Fees Breakdown</strong>
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
                      fee?._type === 'annual' ? fee?.totalFee : fee?.initialFee
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
                Math.ceil(
                  (fee?._type === 'annual' ? fee?.totalFee : fee?.initialFee) +
                    (fee?._type === 'annual'
                      ? 0
                      : fee?._type === 'semiAnnual'
                      ? fee?.semiAnnualFee * 2
                      : fee?.quarterlyFee *
                        (fee?._type === 'annual'
                          ? 1
                          : fee?._type === 'semiAnnual'
                          ? 2
                          : 3))
                ) || 0
              )}
            </span>
          </h4>
        </div>
        <div className="flex items-center px-3 py-3 space-x-3 text-sm text-blue-500 border-2 border-blue-600 rounded bg-blue-50">
          <div className="w-5 h-5">
            <InformationCircleIcon />
          </div>
          <p>
            <strong>NOTE</strong>: Succeeding payments will always incur payment
            gateway fees per transaction.
          </p>
        </div>
        {viewFees ? (
          <Link href={`/account`}>
            <a className="inline-block w-full py-2 text-center text-white rounded bg-primary-500 hover:bg-primary-400 disabled:opacity-50">
              View Dashboard
            </a>
          </Link>
        ) : (
          <button
            className="w-full py-2 text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-50"
            disabled={isSubmitting}
            onClick={submit}
          >
            {isSubmitting ? 'Processing...' : 'Submit & Pay Now'}
          </button>
        )}
      </Modal>
    </AccountLayout>
  );
};

export const getServerSideProps = async () => {
  const schoolFees = await sanityClient.fetch(`*[_type == 'schoolFees']{...}`);
  return { props: { schoolFees } };
};

export default EnrollmentProcess;
