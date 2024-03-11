import { useMemo, useState } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline';
import {
  Accreditation,
  Enrollment,
  Fees,
  Gender,
  GradeLevel,
  GuardianType,
  PaymentType,
  Program,
  Religion,
} from '@prisma/client';
import crypto from 'crypto';
import differenceInCalendarYears from 'date-fns/differenceInCalendarYears';
import differenceInYears from 'date-fns/differenceInYears';
import format from 'date-fns/format';
import { ref, getDownloadURL} from 'firebase/storage';
import { getSession } from 'next-auth/react';
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
import { getGuardianInformation } from '@/prisma/services/user';
import { getStudentRecord } from '@/prisma/services/student-record';
import {
  ACCREDITATION,
  COTTAGE_TYPE,
  ENROLLMENT_TYPE,
  FEES,
  GRADE_LEVEL,
  GRADE_LEVEL_GROUPS,
  GRADE_LEVEL_TYPES,
  PAYMENT_TYPE,
  PROGRAM,
  RELIGION,
  SCHOOL_YEAR,
} from '@/utils/constants';

const steps = [
  'Student Information',
  'Program and Accreditation',
  'School Fees',
];

const payments = [
  'downPayment',
  'secondPayment',
  'thirdPayment',
  'fourthPayment',
];

const EnrollmentProcess = ({ guardian, schoolFees, programs, student }) => {
  const [step, setStep] = useState(0);
  const [viewFees, setViewFees] = useState(false);
  const [isSubmittingCode, setSubmittingCodeState] = useState(false);
  const [isSubmitting, setSubmittingState] = useState(false);
  const [review, setReviewVisibility] = useState(false);
  const [agree, setAgree] = useState(false);
  const [slug, setSlug] = useState('');
  const [firstName, setFirstName] = useState(
    student?.firstName || ''
  );
  const [middleName, setMiddleName] = useState(
    student?.middleName || ''
  );
  const [lastName, setLastName] = useState(
    student?.lastName || ''
  );
  const [gender, setGender] = useState(
    student?.gender || ''
  );
  const [religion, setReligion] = useState(student?.religion || Religion.ROMAN_CATHOLIC);
  const [reason, setReason] = useState(
    student?.reason || ''
    );
  const [enrollmentType, setEnrollmentType] = useState(Enrollment.NEW);
  const [incomingGradeLevel, setIncomingGradeLevel] = useState(
    student?.incomingGradeLevel || GradeLevel.PRESCHOOL
  );
  const [schoolYear, setSchoolYear] = useState('');
  const [formerSchoolName, setFormerSchoolName] = useState(
    student?.formerSchoolName || ''
  );
  const [formerSchoolAddress, setFormerSchoolAddress] = useState(
    student?.formerSchoolAddress || ''
  );
  const [program, setProgram] = useState(Program.HOMESCHOOL_PROGRAM);
  const [cottageType, setCottageType] = useState(null);
  const [accreditation, setAccreditation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [fee, setFee] = useState(null);
  const [birthDate, setBirthDate] = useState(student?.birthDate ? new Date(student.birthDate) : new Date());
  const [paymentMethod, setPaymentMethod] = useState(null);

  const [pictureProgress, setPictureProgress] = useState(0);
  const [birthCertificateProgress, setBirthCertificateProgress] = useState(0);
  const [reportCardProgress, setReportCardProgress] = useState(0);
  const [pictureLink, setPictureLink] = useState(
    student?.image || null
  );
  const [birthCertificateLink, setBirthCertificateLink] = useState(
    student?.liveBirthCertificate || null
  );
  const [reportCardLink, setReportCardLink] = useState(
    student?.reportCard || null
  );
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(null);

  const [primaryGuardianName, setPrimaryGuardianName] = useState(
    guardian?.primaryGuardianName || ''
  );
  const [primaryGuardianOccupation, setPrimaryGuardianOccupation] = useState(
    guardian?.primaryGuardianOccupation || ''
  );
  const [primaryGuardianType, setPrimaryGuardianType] = useState(
    guardian?.primaryGuardianType || GuardianType.MOTHER
  );
  const [primaryGuardianProfile, setPrimaryGuardianProfile] = useState(
    guardian?.primaryGuardianProfile || ''
  );
  const [secondaryGuardianName, setSecondaryGuardianName] = useState(
    guardian?.secondaryGuardianName || ''
  );
  const [secondaryGuardianOccupation, setSecondaryGuardianOccupation] =
    useState(guardian?.secondaryGuardianOccupation || '');
  const [secondaryGuardianType, setSecondaryGuardianType] = useState(
    guardian?.secondaryGuardianType || GuardianType.MOTHER
  );
  const [secondaryGuardianProfile, setSecondaryGuardianProfile] = useState(
    guardian?.secondaryGuardianProfile || ''
  );
  const [mobileNumber, setMobileNumber] = useState(
    guardian?.mobileNumber || ''
  );
  const [telephoneNumber, setTelephoneNumber] = useState(
    guardian?.telephoneNumber || ''
  );
  const [anotherEmail, setAnotherEmail] = useState(
    guardian?.anotherEmail || ''
  );
  const [address1, setAddress1] = useState(guardian?.address1 || '');
  const [address2, setAddress2] = useState(guardian?.address2 || '');
  const [primaryTeacherName, setPrimaryTeacherName] = useState('');
  const [primaryTeacherAge, setPrimaryTeacherAge] = useState('');
  const [primaryTeacherEducation, setPrimaryTeacherEducation] = useState('');
  const [primaryTeacherProfile, setPrimaryTeacherProfile] = useState('');
  const [primaryTeacherRelationship, setPrimaryTeacherRelatiosnship] = useState('');
  const [paymentLink, setPaymentLink] = useState(null);

  const handlePrimaryGuardianName = (event) =>
    setPrimaryGuardianName(event.target.value);
  const handlePrimaryGuardianOccupation = (event) =>
    setPrimaryGuardianOccupation(event.target.value);
  const handlePrimaryGuardianType = (event) =>
    setPrimaryGuardianType(event.target.value);
  const handlePrimaryGuardianProfile = (event) =>
    setPrimaryGuardianProfile(event.target.value);
  const handleSecondaryGuardianName = (event) =>
    setSecondaryGuardianName(event.target.value);
  const handleSecondaryGuardianOccupation = (event) =>
    setSecondaryGuardianOccupation(event.target.value);
  const handleSecondaryGuardianType = (event) =>
    setSecondaryGuardianType(event.target.value);
  const handleSecondaryGuardianProfile = (event) =>
    setSecondaryGuardianProfile(event.target.value);
  const handleMobileNumber = (event) => setMobileNumber(event.target.value);
  const handleTelephoneNumber = (event) =>
    setTelephoneNumber(event.target.value);
  const handleAnotherEmail = (event) => setAnotherEmail(event.target.value);
  const handleAddress1 = (event) => setAddress1(event.target.value);
  const handleAddress2 = (event) => setAddress2(event.target.value);
  const handlePrimaryTeacherName = (event) => setPrimaryTeacherName(event.target.value);
  const handlePrimaryTeacherAge = (event) => setPrimaryTeacherAge(event.target.value);
  const handlePrimaryTeacherEducation = (event) => setPrimaryTeacherEducation(event.target.value);
  const handlePrimaryTeacherProfile = (event) => setPrimaryTeacherProfile(event.target.value);
  const handlePrimaryTeacherRelationship = (event) => setPrimaryTeacherRelatiosnship(event.target.value);

  const age = differenceInYears(new Date(), birthDate) || 0;
  const validateNext =
    (step === 0 &&
      firstName.length > 0 &&
      lastName.length > 0 &&
      reason.length > 0 &&
      schoolYear.length > 0 && 
      formerSchoolName.length > 0 &&
      formerSchoolAddress.length > 0 &&
      primaryGuardianName.length > 0 &&
      primaryGuardianOccupation.length > 0 &&
      primaryGuardianType.length > 0 &&
      primaryGuardianProfile.length > 0 &&
      secondaryGuardianName.length > 0 &&
      secondaryGuardianOccupation.length > 0 &&
      secondaryGuardianType.length > 0 &&
      secondaryGuardianProfile.length > 0 &&
      mobileNumber.length > 0 &&
      telephoneNumber.length > 0 &&
      anotherEmail.length > 0 &&
      address1.length > 0 &&
      address2.length > 0 &&
      birthCertificateLink>0 &&
       birthCertificateLink?.length > 0
      ) ||
    (step === 1 && accreditation !== null) ||
    (step === 2 &&
      payment !== null &&
      paymentMethod &&
      agree &&
      !isSubmittingCode);

  const programFee = programs.find((programFee) => {
    let gradeLevel = incomingGradeLevel;

    if (program === Program.HOMESCHOOL_COTTAGE) {
      if (
        [GradeLevel.GRADE_1, GradeLevel.GRADE_2, GradeLevel.GRADE_3].includes(
          incomingGradeLevel
        )
      ) {
        gradeLevel = GRADE_LEVEL_TYPES.FORM_1;
      }

      if (
        [GradeLevel.GRADE_4, GradeLevel.GRADE_5, GradeLevel.GRADE_6].includes(
          incomingGradeLevel
        )
      ) {
        gradeLevel = GRADE_LEVEL_TYPES.FORM_2;
      }

      if (
        [
          GradeLevel.GRADE_7,
          GradeLevel.GRADE_8,
          GradeLevel.GRADE_9,
          GradeLevel.GRADE_10,
        ].includes(incomingGradeLevel)
      ) {
        gradeLevel = GRADE_LEVEL_TYPES.FORM_3;
      }
    }

    const evaluate =
      program === Program.HOMESCHOOL_COTTAGE
        ? programFee.programType === program &&
          programFee.enrollmentType === enrollmentType &&
          programFee.gradeLevel === gradeLevel &&
          programFee.cottageType === cottageType
        : programFee.programType === program &&
          programFee.enrollmentType === enrollmentType &&
          programFee.gradeLevel === gradeLevel;

    return evaluate;
  });

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

  const applyDiscount = () => {
    setSubmittingCodeState(true);
    api('/api/enroll/discount', {
      body: { code: discountCode },
      method: 'POST',
    }).then((response) => {
      setSubmittingCodeState(false);
      console.log('errors', response.errors);
      console.log('data', response.data);
      if (response.errors) {
        setDiscount(null);
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        setDiscount(response.data);
        toast.success('Discount successfully applied');
      }
    });
  };

  const discountDistribution = useMemo(() => {
    if (!discount) {
    }
  }, [discount]);

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
    setSlug(
      slugify(
        `${firstName.toLowerCase()} ${lastName.toLowerCase()} ${schoolYear.toLowerCase()} ${crypto
          .createHash('md5')
          .update(`${firstName} ${lastName} ${schoolYear}`)
          .digest('hex')
          .substring(0, 6)}}`
      )
    );
  };

  const previous = () => {
    setStep(step - 1);
    document.getElementById('scroller').scroll(0, 0);
  };

  const submit = () => {
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
        schoolYear,
        formerSchoolName,
        formerSchoolAddress,
        program,
        cottageType,
        accreditation,
        payment,
        birthDate,
        pictureLink,
        birthCertificateLink,
        reportCardLink,
        paymentMethod,
        slug,
        primaryGuardianName,
        primaryGuardianOccupation,
        primaryGuardianType,
        primaryGuardianProfile,
        secondaryGuardianName,
        secondaryGuardianOccupation,
        secondaryGuardianType,
        secondaryGuardianProfile,
        mobileNumber,
        telephoneNumber,
        anotherEmail,
        address1,
        address2,
        discountCode,
        primaryTeacherName,
        primaryTeacherAge,
        primaryTeacherRelationship,
        primaryTeacherEducation,
        primaryTeacherProfile,
      },
      method: 'POST',
    })
      .then((response) => {
        setSubmittingState(false);

        if (response.errors) {
          Object.keys(response.errors).forEach((error) =>
            toast.error(response.errors[error].msg)
          );
        } else {
          window.open(response.data.schoolFee.url, '_blank');
          setPaymentLink(response.data.schoolFee.url);
          setViewFees(true);
          toast.success('Student information successfully submitted!');
        }
      })
      .catch(() => {
        setSubmittingState(false);
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
          // case 'birth': {
          //   setBirthCertificateLink(url);
          //   break;
          // }
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
                className={`px-3 py-2 rounded md:w-1/3 ${
                  firstName.length <= 0 ? 'border-red-500 border-2' : 'border'
                }`}
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
                disabled={!!student?.firstName}
              />
              <input
                className="px-3 py-2 border rounded md:w-1/3"
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Middle Name (Optional)"
                value={middleName}
                disabled={!!student?.middleName}
              />
              <input
                className={`px-3 py-2 rounded md:w-1/3 ${
                  lastName.length <= 0 ? 'border-red-500 border-2' : 'border'
                }`}
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
                disabled={!!student?.lastName}
              />
            </div>
          </div>
          <div className="flex flex-row space-x-5">
            <div className="flex flex-col">
              <label className="text-lg font-bold" htmlFor="txtMother">
                Birthday <span className="ml-1 text-red-600">*</span>
              </label>
              <div
                className={`relative flex flex-row rounded ${
                  !birthDate ? 'border-red-500 border-2' : 'border'
                }`}
              >
                <DatePicker
                  selected={birthDate}
                  onChange={(date) => setBirthDate(date)}
                  selectsStart
                  startDate={birthDate}
                  nextMonthButtonLabel=">"
                  previousMonthButtonLabel="<"
                  popperClassName="react-datepicker-left"
                  disabled={!!student?.birthDate}
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
                    disabled={!!student?.gender}
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
                  disabled ={!!student?.religion}
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
                className={`w-full px-3 py-2 rounded ${
                  !reason ? 'border-red-500 border-2' : 'border'
                }`}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why did you choose to homeschool your child?"
                rows={5}
                value={reason}
                disabled = {!!student?.reason}
              ></textarea>
            </div>
          </div>
        </div>
        <Card.Body title="Files and Documents">{renderFileUpload()}</Card.Body>
        <Card.Body title="Educational Background">
          {renderEducationalBackground()}
        </Card.Body>
        <Card.Body title="Guardian Information">
          {renderGuardianInformation()}
        </Card.Body>
        <Card.Body title="Guardian Information">
          {renderTeacherInformation()}
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
              <td
                className={`w-1/2 px-3 py-2 ${
                  !birthCertificateLink ? 'border-red-500 border-2' : 'border'
                }`}
              >
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
                  disabled={!firstName || !lastName || !!student?.liveBirthCertificate}
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
          <div
            className={`relative inline-block w-full rounded ${
              !enrollmentType ? 'border-red-500 border-2' : 'border'
            }`}
          >
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
              <div
                className={`relative inline-block w-full rounded ${
                  !incomingGradeLevel ? 'border-red-500 border-2' : 'border'
                }`}
              >
                <select
                  className="w-full px-3 py-2 capitalize rounded appearance-none"
                  onChange={(e) => {
                    setIncomingGradeLevel(e.target.value);
                    // setAccreditation(null);
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
        <div className="flex flex-row space-x-5">
          <div className="flex flex-col w-full">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Shool Year <span className="ml-1 text-red-600">*</span>
            </label>
            <div className="flex flex-row">
              <div
                className={`relative inline-block w-full rounded ${
                  !schoolYear ? 'border-red-500 border-2' : 'border'
                }`}
              >
                <select
                  className="w-full px-3 py-2 capitalize rounded appearance-none"
                  onChange={(e) => {
                    setSchoolYear(e.target.value);
                  }}
                  value={schoolYear}
                >
                  <option value="">Please select School year...</option>
                  <option value={SCHOOL_YEAR.SY_2023_2024}>
                    {SCHOOL_YEAR.SY_2023_2024}
                  </option>
                  <option value={SCHOOL_YEAR.SY_2024_2025}>
                    {SCHOOL_YEAR.SY_2024_2025}
                  </option>
                  {/* {Object.keys(SCHOOL_YEAR).map((entry, index) => (
                    <option key={index} value={entry}>
                      {SCHOOL_YEAR[entry]}
                    </option>
                  ))} */}
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
              className={`px-3 py-2 rounded md:w-2/3 ${
                !formerSchoolName ? 'border-red-500 border-2' : 'border'
              }`}
              onChange={(e) => setFormerSchoolName(e.target.value)}
              placeholder="Former School Name"
              value={formerSchoolName}
              disabled = {!!student?.formerSchoolName}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Former School Address <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="relative flex flex-row space-x-5">
            <textarea
              className={`w-full px-3 py-2 rounded ${
                !formerSchoolAddress ? 'border-red-500 border-2' : 'border'
              }`}
              onChange={(e) => setFormerSchoolAddress(e.target.value)}
              placeholder="Former School Address"
              rows={3}
              value={formerSchoolAddress}
              disabled = {!!student?.formerSchoolAddress}
            ></textarea>
          </div>
        </div>
      </div>
    );
  };

  const renderGuardianInformation = () => {
    return (
      <div className="flex flex-col p-5 space-y-5 overflow-auto">
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Primary Guardian <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="flex flex-col space-x-0 space-y-5 md:space-y-0 md:flex-row md:space-x-5">
            <input
              className={`px-3 py-2 rounded md:w-1/2 ${
                !primaryGuardianName ? 'border-red-500 border-2' : 'border'
              }`}
              placeholder="Primary Guardian's Full Name"
              onChange={handlePrimaryGuardianName}
              value={primaryGuardianName}
              disabled = {!!guardian?.primaryGuardianName}
            />
            <input
              className={`px-3 py-2 rounded md:w-1/4 ${
                !primaryGuardianOccupation
                  ? 'border-red-500 border-2'
                  : 'border'
              }`}
              placeholder="Occupation"
              onChange={handlePrimaryGuardianOccupation}
              value={primaryGuardianOccupation}
              disabled = {!!guardian?.primaryGuardianOccupation}
            />
            <div
              className={`relative inline-block rounded md:w-1/4 ${
                !primaryGuardianType ? 'border-red-500 border-2' : 'border'
              }`}
            >
              <select
                className="w-full px-3 py-2 capitalize rounded appearance-none"
                onChange={handlePrimaryGuardianType}
                value={primaryGuardianType}
                disabled = {!!guardian?.primaryGuardianType}
              >
                {Object.keys(GuardianType).map((key, index) => (
                  <option key={index} value={GuardianType[`${key}`]}>
                    {GuardianType[`${key}`].replace('_', ' ').toLowerCase()}
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
          <input
            className={`px-3 py-2 rounded ${
              !primaryGuardianProfile ? 'border-red-500 border-2' : 'border'
            }`}
            placeholder="Primary Guardian's Facebook Profile Link"
            onChange={handlePrimaryGuardianProfile}
            value={primaryGuardianProfile}
            disabled = {!!guardian?.primaryGuardianProfile}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Secondary Guardian <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="flex flex-col space-x-0 space-y-5 md:space-y-0 md:flex-row md:space-x-5">
            <input
              className={`px-3 py-2 rounded md:w-1/2 ${
                !secondaryGuardianName ? 'border-red-500 border-2' : 'border'
              }`}
              placeholder="Secondary Guardian's Full Name"
              onChange={handleSecondaryGuardianName}
              value={secondaryGuardianName}
              disabled = {!!guardian?.secondaryGuardianName}
            />
            <input
              className={`px-3 py-2 rounded md:w-1/4 ${
                !secondaryGuardianOccupation
                  ? 'border-red-500 border-2'
                  : 'border'
              }`}
              placeholder="Occupation"
              onChange={handleSecondaryGuardianOccupation}
              value={secondaryGuardianOccupation}
              disabled = {!!guardian?.secondaryGuardianOccupation}
            />
            <div
              className={`relative inline-block rounded md:w-1/4 ${
                !secondaryGuardianType ? 'border-red-500 border-2' : 'border'
              }`}
            >
              <select
                className="w-full px-3 py-2 capitalize rounded appearance-none"
                onChange={handleSecondaryGuardianType}
                value={secondaryGuardianType}
                disabled = {!!guardian?.secondaryGuardianType}
              >
                {Object.keys(GuardianType).map((key, index) => (
                  <option key={index} value={GuardianType[`${key}`]}>
                    {GuardianType[`${key}`].replace('_', ' ').toLowerCase()}
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
          <input
            className={`px-3 py-2 rounded ${
              !secondaryGuardianProfile ? 'border-red-500 border-2' : 'border'
            }`}
            placeholder="Secondary Guardian's Facebook Profile Link"
            onChange={handleSecondaryGuardianProfile}
            value={secondaryGuardianProfile}
            disabled = {!!guardian?.secondaryGuardianProfile}
          />
        </div>
        <hr className="border border-dashed" />
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Contact Numbers <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="flex flex-row space-x-5">
            <input
              className={`px-3 py-2 rounded md:w-1/2 ${
                !mobileNumber ? 'border-red-500 border-2' : 'border'
              }`}
              placeholder="Mobile Number"
              onChange={handleMobileNumber}
              value={mobileNumber}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row space-x-5">
            <input
              className={`px-3 py-2 rounded md:w-1/2 ${
                !telephoneNumber ? 'border-red-500 border-2' : 'border'
              }`}
              placeholder="Telephone Number"
              onChange={handleTelephoneNumber}
              value={telephoneNumber}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Additional Email <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="flex flex-row space-x-5">
            <input
              className={`px-3 py-2 rounded md:w-1/2 ${
                !anotherEmail ? 'border-red-500 border-2' : 'border'
              }`}
              placeholder="another@email.com"
              onChange={handleAnotherEmail}
              value={anotherEmail}
            />
          </div>
        </div>
        <hr className="border border-dashed" />
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Complete Address <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="flex flex-row space-x-5">
            <input
              className={`px-3 py-2 rounded md:w-3/4 ${
                !address1 ? 'border-red-500 border-2' : 'border'
              }`}
              placeholder="House No. St. Name, Village/Subdivision, Brgy."
              onChange={handleAddress1}
              value={address1}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row space-x-5">
            <input
              className={`px-3 py-2 rounded md:w-3/4 ${
                !address2 ? 'border-red-500 border-2' : 'border'
              }`}
              placeholder="City, Country, ZIP Code"
              onChange={handleAddress2}
              value={address2}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderTeacherInformation = () => {
    return (
      <div className="flex flex-col p-5 space-y-5 overflow-auto">
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Who will teach the student? <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="flex flex-col space-x-0 space-y-5 md:space-y-0 md:flex-row md:space-x-5">
            <input
              className={`px-3 py-2 rounded md:w-1/2 ${
                !primaryTeacherName ? 'border-red-500 border-2' : 'border'
              }`}
              placeholder="Guardian's Full Name"
              onChange={handlePrimaryTeacherName}
              value={primaryTeacherName}
            />
            <input
              className={`px-3 py-2 rounded md:w-1/4 ${
                !primaryTeacherAge
                  ? 'border-red-500 border-2'
                  : 'border'
              }`}
              placeholder="Age"
              onChange={handlePrimaryTeacherAge}
              value={primaryTeacherRelationship}
            />
            <input
              className={`px-3 py-2 rounded md:w-1/4 ${
                !primaryTeacherRelationship
                  ? 'border-red-500 border-2'
                  : 'border'
              }`}
              placeholder="Relationship"
              onChange={handlePrimaryTeacherRelationship}
              value={primaryTeacherRelationship}
            />
          </div>
        </div>
        
        <div className="flex flex-col">
          <input
            className={`px-3 py-2 rounded ${
              !primaryTeacherProfile ? 'border-red-500 border-2' : 'border'
            }`}
            placeholder="Guardian's Facebook Profile Link"
            onChange={handlePrimaryTeacherProfile}
            value={primaryTeacherProfile}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Highest Educational Attainment <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="flex flex-col space-x-0 space-y-5 md:space-y-0 md:flex-row md:space-x-5">
            <input
              className={`px-3 py-2 rounded md:w-1/2 ${
                !primaryTeacherEducation ? 'border-red-500 border-2' : 'border'
              }`}
              placeholder="ex: College Graduate"
              onChange={handlePrimaryTeacherEducation}
              value={primaryTeacherEducation}
            />

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
        <div className="flex flex-row">
          <div
            className={`relative inline-block w-full rounded ${
              !program ? 'border-red-500 border-2' : 'border'
            }`}
          >
            <select
              className="w-full px-3 py-2 capitalize rounded appearance-none"
              onChange={(e) => {
                setProgram(e.target.value);
                // setAccreditation(null);
              }}
              value={program}
            >
              {Object.keys(PROGRAM).map((entry, index) => (
                <option
                  key={index}
                  disabled={
                    entry === Program.HOMESCHOOL_COTTAGE &&
                    incomingGradeLevel === GradeLevel.PRESCHOOL
                  }
                  value={entry}
                >
                  {PROGRAM[entry].toLowerCase()}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDownIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
        {program === Program.HOMESCHOOL_COTTAGE && (
          <>
            <hr className="border border-dashed" />
            <label className="text-lg font-bold" htmlFor="txtMother">
              Select a Cottage Type
              <span className="ml-1 text-red-600">*</span>
            </label>
            <div className="flex flex-row">
              <div
                className={`relative inline-block w-full rounded ${
                  !cottageType ? 'border-red-500 border-2' : 'border'
                }`}
              >
                <select
                  className="w-full px-3 py-2 capitalize rounded appearance-none"
                  onChange={(e) => {
                    if (e.target.value) {
                      setCottageType(e.target.value);
                    } else {
                      setCottageType(null);
                    }
                  }}
                  value={cottageType}
                >
                  <option value="">Please select cottage type...</option>
                  {Object.keys(COTTAGE_TYPE).map((entry, index) => (
                    <option key={index} value={entry}>
                      {COTTAGE_TYPE[entry]}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </>
        )}
        {/* <div className="flex flex-col space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
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
                : 'bg-gray-300 opacity-25 rounded'
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
        </div> */}
        <hr className="border border-dashed" />
        <label className="text-lg font-bold" htmlFor="txtMother">
          Select an Accreditation <span className="ml-1 text-red-600">*</span>
        </label>
        <div className="flex flex-row">
          <div
            className={`relative inline-block w-full rounded ${
              !accreditation ? 'border-red-500 border-2' : 'border'
            }`}
          >
            <select
              className="w-full px-3 py-2 capitalize rounded appearance-none"
              onChange={(e) => {
                if (e.target.value) {
                  setAccreditation(e.target.value);
                } else {
                  setAccreditation(null);
                }
              }}
              value={accreditation}
            >
              <option value="">Please select accreditation...</option>
              <option value={Accreditation.LOCAL}>
                {ACCREDITATION[Accreditation.LOCAL]}
              </option>
              <option
                disabled={
                  !(
                    incomingGradeLevel !== GradeLevel.PRESCHOOL &&
                    incomingGradeLevel !== GradeLevel.K1
                  )
                }
                value={Accreditation.INTERNATIONAL}
              >
                {ACCREDITATION[Accreditation.INTERNATIONAL]}
              </option>
              <option
                disabled={
                  !(
                    incomingGradeLevel !== GradeLevel.PRESCHOOL &&
                    incomingGradeLevel !== GradeLevel.K1
                  )
                }
                value={Accreditation.DUAL}
              >
                {ACCREDITATION[Accreditation.DUAL]}
              </option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDownIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="flex flex-col space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
          {/* {program === Program.HOMESCHOOL_PROGRAM && (
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
                    : 'bg-gray-300 opacity-25 rounded'
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
                    : 'bg-gray-300 opacity-25 rounded'
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
          )} */}
          {/* {program === Program.HOMESCHOOL_COTTAGE && (
            <>
              <div
                className={`relative flex flex-col items-center justify-center w-full p-5 md:w-1/4 border-2 border-primary-200 ${
                  incomingGradeLevel === GradeLevel.K2
                    ? accreditation === Accreditation.LOCAL
                      ? 'border-4 rounded-xl border-primary-200 bg-primary-50/50'
                      : 'border border-dashed rounded cursor-pointer hover:border-primary-200 hover:bg-primary-50/25'
                    : 'bg-gray-300 opacity-25 rounded'
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
                    : 'bg-gray-300 opacity-25 rounded'
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
                    : 'bg-gray-300 opacity-25 rounded'
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
                    : 'bg-gray-300 opacity-25 rounded'
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
          )} */}
        </div>
        <div className="p-5 space-y-5 text-xs leading-relaxed bg-gray-100 rounded">
          <h3 className="text-sm font-bold">
            General Policies and Guidelines:
          </h3>
          <ol className="px-5 list-decimal">
            <li>
              Parents who intend to enroll are required to watch our "HOMESCHOOL
              FUNDAMENTALS" videos.
            </li>
            <li>
              Should the parent choose to use Pure Charlotte Mason or A CM
              inspired Curriculum, the parents must attend the CM
              training/workshop faithfully.
            </li>
            <li>
              It is expected of the parents to fulfill the annual, bi-annual
              dutifully or Quarterly dues and other financial obligations of
              their children on time.
            </li>
          </ol>
          <p>Parents understand that:</p>
          <ol className="px-5 list-disc">
            <li>
              A child is considered fully enrolled only after full payment of
              the annual homeschool fee.
            </li>
          </ol>
          <p>
            As a parent-teacher, I acknowledge that it is my responsibility to:
          </p>
          <ol className="px-5 list-disc">
            <li>
              Commit time to plan, study, and organize our homeschool
              curriculum.
            </li>
            <li>
              Intentionally attend/watch the self-paced training and the live LP
              parent-teacher training.
            </li>
            <li>
              Dedicate time to attend/participate in the scheduled coaching
              sessions with the LP homeschool advisers/coach whenever available.
            </li>
            <li>
              Administer quarterly assessments (using full CM or CM-inspired
              approach).
            </li>
            <li>
              Submit quarterly grades and final grades (with average) at the end
              of the school year using the instructions provided by Living Pupil
              Homeschool. (For K2 to Grade 10 students only).
            </li>
            <li>
              Make the school aware of any concerns or problems that might
              affect my/our child’s academic work or behavior.
            </li>
            <li>
              Comply with DepEd’s number of school days per school year
              requirement. (at least 205 school days and follow the DepEd
              calendar in terms of school records).
            </li>
          </ol>
          <p>
            As part of the Living Pupil family, I acknowledge that it is my
            responsibility to:
          </p>
          <ol className="px-5 list-disc">
            <li>
              Support and encourage Living Pupil Homeschool’s values that are
              central to the philosophy and mission of Charlotte Mason.
            </li>
            <li>
              Make myself aware of the latest LP advisory and announcements by
              regularly checking my emails, Living Pupil Facebook Page, Living
              Pupil FB groups/Living Pupil FB chat room, and other communication
              platforms used by the school.
            </li>
            <li>
              Responsibly fulfill my financial obligation to the school on time.
            </li>
            <li>
              Understand the importance of being present during LP events and
              activities.
            </li>
            <li>
              Permit to use photographs/videos of me and my family and
              information obtained through personal interviews in any of Living
              Pupil’s publications, social media platforms, marketing materials,
              or virtual events.
            </li>
            <li>
              Agree not to reproduce, distribute or display (post/upload)
              lecture notes or parent training recordings or course materials in
              any other way — whether or not a fee is charged — without my
              express written consent.
            </li>
          </ol>
        </div>
      </div>
    );
  };

  const renderSchoolFees = () => {
    const programFeeByAccreditation = programFee?.tuitionFees.find(
      (tuition) => tuition.type === accreditation
    );

    return (
      programFeeByAccreditation && (
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
          <div
            className={`relative inline-block w-full rounded ${
              !payment ? 'border-red-500 border-2' : 'border'
            }`}
          >
            <select
              className="w-full px-3 py-2 capitalize rounded appearance-none"
              onChange={(e) => {
                setPayment(e.target.value ? e.target.value : null);

                if (e.target.value === PaymentType.ANNUAL) {
                  setFee(programFeeByAccreditation?.paymentTerms[0]);
                } else if (e.target.value === PaymentType.SEMI_ANNUAL) {
                  setFee(programFeeByAccreditation?.paymentTerms[1]);
                } else if (e.target.value === PaymentType.QUARTERLY) {
                  setFee(programFeeByAccreditation?.paymentTerms[2]);
                }
              }}
              value={payment}
            >
              <option value="">Please select payment type...</option>
              <option value={PaymentType.ANNUAL}>Full Payment</option>
              <option value={PaymentType.SEMI_ANNUAL}>
                Three (3) Term Payment (Initial Fee + Two Payment Term Fees)
              </option>
              <option value={PaymentType.QUARTERLY}>
                Four (4) Term Payment (Initial Fee + Three Payment Term Fees)
              </option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDownIcon className="w-5 h-5" />
            </div>
          </div>
          <hr />
          <div className="relative flex flex-row space-x-5">
            <div
              className={`flex flex-col md:flex-row space-y-5 md:space-y-0 md:items-center md:justify-between w-full px-5 py-3 hover:shadow-lg border-2 border-primary-200 ${
                payment === PaymentType.ANNUAL
                  ? 'border-4 cursor-pointer rounded-xl border-primary-400 bg-primary-50'
                  : 'border border-dashed rounded cursor-pointer hover:border-primary-400 hover:bg-primary-50/25'
              }`}
              onClick={() => {
                setPayment(PaymentType.ANNUAL);
                setFee(programFeeByAccreditation?.paymentTerms[0]);
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
                    }).format(
                      programFeeByAccreditation?.paymentTerms[0]?.fullPayment ||
                        0
                    )}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold">
                <span>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(
                    programFeeByAccreditation?.paymentTerms[0]?.fullPayment || 0
                  )}
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
                setFee(programFeeByAccreditation?.paymentTerms[1]);
              }}
            >
              {payment === PaymentType.SEMI_ANNUAL && (
                <div className="absolute flex items-center justify-center w-8 h-8 text-white rounded-full -right-3 -top-3 bg-primary-200">
                  <CheckIcon className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">Three (3) Term Payment</h3>
                <div>
                  <span>
                    Initial Fee:{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      programFeeByAccreditation?.paymentTerms[1]?.downPayment ||
                        0
                    )}{' '}
                    +
                  </span>
                  <span>
                    (
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      programFeeByAccreditation?.paymentTerms[1]
                        ?.secondPayment || 0
                    )}{' '}
                    +{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      programFeeByAccreditation?.paymentTerms[1]
                        ?.thirdPayment || 0
                    )}
                    )
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'PHP',
                }).format(
                  programFeeByAccreditation?.paymentTerms[1]?.downPayment +
                    programFeeByAccreditation?.paymentTerms[1]?.secondPayment +
                    programFeeByAccreditation?.paymentTerms[1]?.thirdPayment ||
                    0
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
                setFee(programFeeByAccreditation?.paymentTerms[2]);
              }}
            >
              {payment === PaymentType.QUARTERLY && (
                <div className="absolute flex items-center justify-center w-8 h-8 text-white rounded-full -right-3 -top-3 bg-primary-200">
                  <CheckIcon className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">Four (4) Term Payment</h3>
                <div>
                  <span>
                    Initial Fee:{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      programFeeByAccreditation?.paymentTerms[2]?.downPayment ||
                        0
                    )}{' '}
                    +
                  </span>
                  <span>
                    (
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      programFeeByAccreditation?.paymentTerms[2]
                        ?.secondPayment || 0
                    )}{' '}
                    +{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      programFeeByAccreditation?.paymentTerms[2]
                        ?.thirdPayment || 0
                    )}{' '}
                    +{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      programFeeByAccreditation?.paymentTerms[2]
                        ?.fourthPayment || 0
                    )}
                    )
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'PHP',
                }).format(
                  programFeeByAccreditation?.paymentTerms[2]?.downPayment +
                    programFeeByAccreditation?.paymentTerms[2]?.secondPayment +
                    programFeeByAccreditation?.paymentTerms[2]?.thirdPayment +
                    programFeeByAccreditation?.paymentTerms[2]?.fourthPayment ||
                    0
                )}
              </h3>
            </div>
          </div>
          <div className="p-5 space-y-5 text-xs leading-relaxed bg-gray-100 rounded">
            <h3 className="text-sm font-bold">Payment Policies:</h3>
            <ol className="px-5 list-decimal">
              <li>
                ALL payment transactions must be processed via our payment
                partner, dragon pay (online link provided by our finance or LP
                website). This is to ensure a safe, real-time one-day processing
                and posting of successful transactions. This means no payment
                proof submission is required from you, and there is no need to
                input our LP bank details upon payment. Payments NOT MADE
                through this channel may not be recognized or recorded.
              </li>
              <li>
                A 3% interest will be added to the school fee when the parents
                are not able to pay on time.
              </li>
              <li>
                For Post-dated checks, bounced or delayed payments will be
                subjected to 5% monthly interest.
              </li>
              <li>
                All school records will be released after the student has been
                cleared of financial and academic obligations from LPHS.
              </li>
              <li>
                In case of non-compliance with LPHS requirements and/or the
                student decides to withdraw/ drop out, the tuition fee and
                miscellaneous fees will not be carried over to the next school
                year.
              </li>
              <li>
                Living Pupil Homeschool's foundation is built on trust and
                relationships with our families. We, therefore, require our
                Parent-Teachers to do their task with honesty & commitment.
                Should there be homeschool concerns, please communicate directly
                with our team.
              </li>
            </ol>
            <h3 className="text-sm font-bold">
              Refund on Tuition Fees and other fees:
            </h3>
            <ol className="px-5 list-decimal">
              <li>
                The down payment upon enrollment is a nonrefundable deposit.
              </li>
              <li>
                In the event that the parent wishes to transfer or withdraw
                their child's enrollment from LPHS and they paid the tuition fee
                in full or an amount greater than the required down payment, the
                parent is entitled to a tuition refund provided: (1) they submit
                a letter of withdrawal/transfer (2) has already paid the tuition
                and other fees in full. The amount of the refund depends on the
                following:
                <ul className="py-5 list-disc">
                  <li>
                    When the student withdraws a week after enrollment, LP
                    finance will charge 10% of the amount paid plus the
                    nonrefundable down payment.
                  </li>
                  <li>
                    When the student withdraws two (2) weeks after enrollment,
                    LP finance will charge 20% of the amount paid plus the
                    nonrefundable down payment.
                  </li>
                  <li>
                    No refund will be given when the student withdraws one (1)
                    month after enrollment.
                  </li>
                  <li>
                    There will be no refund for books and other learning
                    materials.
                  </li>
                </ul>
              </li>
              <li>
                When the student withdraws before the school year ends, the
                parent will pay the annual tuition fee for the school records to
                be released.
              </li>
              <li>
                All students are required to participate in the year-end
                PAGSAULOG (Graduation, Moving-up, and Recognition Celebration)
                either online or face-to-face and are subject to a registration
                fee of P1300 - P2500 per family.
              </li>
            </ol>
          </div>
          <div>
            <p>
              By completing and submitting this form, we agree to follow the
              terms listed above in the Living Pupil Homeschool Agreement. We
              understand that this agreement is bona fide and will be enforced.
              Living Pupil Homeschool reserves the right to amend this
              Agreement.
            </p>
            <hr className="my-5 border border-dashed" />
            <div className="flex flex-col mt-5 space-x-0 space-y-5 md:flex-row md:justify-between md:space-x-5 md:space-y-0">
              <div className="space-y-3 md:w-1/2">
                <label className="text-lg font-bold" htmlFor="txtMother">
                  Select Payment Method
                  <span className="ml-1 text-red-600">*</span>
                </label>
                <div className="flex flex-row">
                  <div className="relative inline-block w-full border rounded">
                    <select
                      className="w-full px-3 py-2 capitalize rounded appearance-none"
                      onChange={(e) => {
                        setPaymentMethod(
                          e.target.value ? e.target.value : null
                        );
                      }}
                      value={paymentMethod}
                    >
                      <option value="">Please select payment method...</option>
                      <option value={Fees.ONLINE}>
                        Online Banking (+ Php 10.00)
                      </option>
                      <option value={Fees.OTC}>
                        Over-the-Counter Banking (+ Php 15.00)
                      </option>
                      <option value={Fees.PAYMENT_CENTERS}>
                        Payment Centers (+ Php 20.00)
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                {/* <div
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
              </div> */}
                <div className="flex flex-col py-5">
                  <label className="text-lg font-bold" htmlFor="txtMother">
                    Discount Code
                  </label>
                  <div className="flex border rounded">
                    <input
                      className="w-3/4 px-3 py-2 rounded-l"
                      onChange={(e) => {
                        setDiscountCode(e.target.value);
                        setDiscount(null);
                      }}
                      placeholder="Input discount code here"
                      value={discountCode}
                    />
                    <button
                      className="w-1/4 rounded-r bg-secondary-500 hover:bg-secondary-400"
                      disabled={isSubmittingCode}
                      onClick={applyDiscount}
                    >
                      Apply
                    </button>
                  </div>
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
                          (fee?._type === 'fullTermPayment'
                            ? fee?.fullPayment
                            : fee?.downPayment) || 0
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
                  <div className="flex items-center justify-between p-5 space-x-5">
                    <div>
                      <h5 className="font-medium">Discount</h5>
                      <h6 className="text-xs text-gray-400">
                        Based on applied discount code:{' '}
                        <span className="font-bold text-green-600">
                          {discountCode || '-'}{' '}
                          {`${
                            discount
                              ? `(${Number(discount.value).toFixed(2)}${
                                  discount.type === 'VALUE' ? 'Php' : '%'
                                })`
                              : ''
                          }`}
                        </span>
                      </h6>
                      {fee && fee?._type !== 'fullTermPayment' && (
                        <p className="text-xs text-semibold text-primary-500">
                          <strong>NOTE:</strong> Discount will be applied on the
                          second payment.
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={discount ? 'text-red-600' : ''}>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'PHP',
                        }).format(
                          discount
                            ? discount.type === 'VALUE'
                              ? (discount?.code
                                  ?.toLowerCase()
                                  .includes('pastor')
                                  ? Math.ceil(
                                      fee?._type === 'fullTermPayment'
                                        ? fee?.fullPayment
                                        : fee?._type === 'threeTermPayment'
                                        ? fee?.downPayment +
                                          fee?.secondPayment +
                                          fee?.thirdPayment
                                        : fee?.downPayment +
                                          fee?.secondPayment +
                                          fee?.thirdPayment +
                                          fee?.fourthPayment
                                    ) - discount.value
                                  : Number(discount.value).toFixed(2)) * -1
                              : Math.ceil(
                                  fee?._type === 'fullTermPayment'
                                    ? fee?.fullPayment
                                    : fee?.secondPayment
                                ) *
                                (discount.value / 100) *
                                -1
                            : 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between p-5 space-x-5 bg-gray-100 border-t border-dashed">
                    <div>
                      <h5 className="font-bold">
                        {fee?._type === 'fullTermPayment'
                          ? 'Total Payable'
                          : 'Initial Fee'}
                      </h5>
                      <h6 className="text-xs text-primary-500">
                        <strong>NOTE</strong>: Succeeding payments will always
                        incur payment gateway fees per transaction and see
                        breakdown for applicable discounts
                      </h6>
                    </div>
                    <div className="text-right">
                      <span>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'PHP',
                        }).format(
                          (fee?._type === 'fullTermPayment'
                            ? fee?.fullPayment -
                              (discount
                                ? discount?.type === 'VALUE'
                                  ? discount?.code
                                      ?.toLowerCase()
                                      .includes('pastor')
                                    ? Math.ceil(
                                        fee?._type === 'fullTermPayment'
                                          ? fee?.fullPayment
                                          : fee?._type === 'threeTermPayment'
                                          ? fee?.downPayment +
                                            fee?.secondPayment +
                                            fee?.thirdPayment
                                          : fee?.downPayment +
                                            fee?.secondPayment +
                                            fee?.thirdPayment +
                                            fee?.fourthPayment
                                      ) - discount.value
                                    : discount.value
                                  : (discount.value / 100) * fee?.fullPayment
                                : 0)
                            : fee?.downPayment) + FEES[paymentMethod] || 0
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
      )
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
                    {fee?._type === 'fullTermPayment'
                      ? 'Total Fee'
                      : 'Initial Fee'}
                  </td>
                  <td className="px-3 py-1 text-right border">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      fee?._type === 'fullTermPayment'
                        ? fee?.fullPayment
                        : fee?.downPayment
                    )}
                  </td>
                </tr>
                {Array.from(
                  Array(
                    fee?._type === 'fullTermPayment'
                      ? 0
                      : fee?._type === 'threeTermPayment'
                      ? 2
                      : 3
                  ),
                  (_, index) => (
                    <tr key={index}>
                      <td className="px-3 py-1 border">
                        {fee?._type === 'fullTermPayment'
                          ? ''
                          : fee?._type === 'threeTermPayment'
                          ? `Three (3) Term Payment #${index + 1}`
                          : `Four (4) Term Payment #${index + 1}`}
                      </td>
                      <td className="px-3 py-1 text-right border">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'PHP',
                        }).format(
                          fee?._type === 'fullTermPayment'
                            ? 0
                            : fee && fee[payments[index + 1]]
                        )}{' '}
                        {discount &&
                        discount?.code?.toLowerCase().includes('pastor') ? (
                          <span className="text-red-600">
                            (-
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'PHP',
                            }).format(
                              fee &&
                                fee[payments[index + 1]] -
                                  (discount?.value - fee?.downPayment) / 3
                            )}
                            )
                          </span>
                        ) : (
                          index === 0 &&
                          discount && (
                            <span className="text-red-600">
                              (-
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'PHP',
                              }).format(
                                discount?.type === 'VALUE'
                                  ? discount?.value
                                  : (discount?.value / 100) *
                                      Math.ceil(fee?.secondPayment)
                              )}
                              )
                            </span>
                          )
                        )}
                      </td>
                    </tr>
                  )
                )}
                {discount && (
                  <tr>
                    <td className="px-3 py-1 border">
                      Total Discounts:{' '}
                      <strong className="text-green-600">
                        {discountCode || '-'}{' '}
                        {`${
                          discount
                            ? `(${Number(discount.value).toFixed(2)}${
                                discount.type === 'VALUE' ? 'Php' : '%'
                              })`
                            : ''
                        }`}
                      </strong>
                    </td>
                    <td className="px-3 py-1 text-right text-red-600 border">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(
                        discount
                          ? discount.type === 'VALUE'
                            ? (discount?.code?.toLowerCase().includes('pastor')
                                ? Math.ceil(
                                    fee?._type === 'fullTermPayment'
                                      ? fee?.fullPayment
                                      : fee?._type === 'threeTermPayment'
                                      ? fee?.downPayment +
                                        fee?.secondPayment +
                                        fee?.thirdPayment
                                      : fee?.downPayment +
                                        fee?.secondPayment +
                                        fee?.thirdPayment +
                                        fee?.fourthPayment
                                  ) - discount.value
                                : Number(discount.value).toFixed(2)) * -1
                            : Math.ceil(
                                fee?._type === 'fullTermPayment'
                                  ? fee?.fullPayment
                                  : fee?.secondPayment
                              ) *
                              (discount.value / 100) *
                              -1
                          : 0
                      )}
                    </td>
                  </tr>
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
                  fee?._type === 'fullTermPayment'
                    ? fee?.fullPayment
                    : fee?._type === 'threeTermPayment'
                    ? fee?.downPayment + fee?.secondPayment + fee?.thirdPayment
                    : fee?.downPayment +
                      fee?.secondPayment +
                      fee?.thirdPayment +
                      fee?.fourthPayment
                ) -
                  (discount
                    ? discount?.type === 'VALUE'
                      ? discount?.code?.toLowerCase().includes('pastor')
                        ? Math.ceil(
                            fee?._type === 'fullTermPayment'
                              ? fee?.fullPayment
                              : fee?._type === 'threeTermPayment'
                              ? fee?.downPayment +
                                fee?.secondPayment +
                                fee?.thirdPayment
                              : fee?.downPayment +
                                fee?.secondPayment +
                                fee?.thirdPayment +
                                fee?.fourthPayment
                          ) - discount.value
                        : discount.value
                      : (discount.value / 100) *
                        (fee?._type === 'fullTermPayment'
                          ? fee?.fullPayment
                          : fee?.secondPayment)
                    : 0) || 0
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
          <>
            {paymentLink && (
              <a
                className="inline-block w-full py-2 text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
                href={paymentLink}
                target="_blank"
              >
                Pay Now
              </a>
            )}
            <Link href={`/account`}>
              <a className="inline-block w-full py-2 text-center text-white rounded bg-primary-500 hover:bg-primary-400 disabled:opacity-25">
                View Dashboard
              </a>
            </Link>
          </>
        ) : (
          <button
            className="w-full py-2 text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
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

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  
  const [guardian, schoolFees, programs] = await Promise.all([
    getGuardianInformation(session.user?.userId),
    sanityClient.fetch(`*[_type == 'schoolFees']{...}`),
    sanityClient.fetch(`*[_type == 'programs']`),
  ]);

  const studentID = context.query.studentID;
  let student = null;
  let formattedBirthDate = null;

  if (studentID) {
    student = await getStudentRecord(studentID);
    formattedBirthDate = student.birthDate.toISOString();
  }

  return {
    props: {
      guardian,
      schoolFees,
      programs,
      student: studentID ? { ...student, birthDate: formattedBirthDate } : null
    }
  };
};


export default EnrollmentProcess;
