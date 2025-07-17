import React from 'react';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/outline';
import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import DatePicker from 'react-datepicker';
import {
  ACCREDITATION,
  ACCREDITATION_NEW,
  ENROLLMENT_TYPE,
  GRADE_LEVEL,
  PROGRAM,
  RELIGION,
  COTTAGE_TYPE,
  FEES,
  GRADE_LEVEL_GROUPS,
  GRADE_LEVEL_TYPES,
  PAYMENT_TYPE,
  SCHOOL_YEAR,
  ENROLLMENT_STATUS_BG_COLOR,
  STUDENT_STATUS,
  STATUS_BG_COLOR,
  STATUS,
  getMonthIndex,
  getMonthIndexCurrent,
  calculateMonthlyPayment,
} from '@/utils/constants';
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
import sanityClient from '@/lib/server/sanity';
import { useStudents, useWorkspaces } from '@/hooks/data';
import { UserIcon } from '@heroicons/react/solid';
import Image from 'next/image';
import format from 'date-fns/format';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/lib/client/firebase';
import crypto from 'crypto';
import differenceInYears from 'date-fns/differenceInYears';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector
} from '@mui/x-data-grid';
import toast from 'react-hot-toast';
import api from '@/lib/common/api';
import CenteredModal from '@/components/Modal/centered-modal';

const filterValueOptions = {
  accreditation: ACCREDITATION_NEW,
  enrollmentType: ENROLLMENT_TYPE,
  gender: {
    FEMALE: 'Female',
    MALE: 'Male',
  },
  incomingGradeLevel: GRADE_LEVEL,
  program: PROGRAM,
  religion: RELIGION,
  schoolYear: {
    2022: '2022 - 2023',
    2023: '2023 - 2024',
  },
};

const scholarships = {
  semi: 'Semi-scholar-regular',
  semiCottage: 'Semi-scholar-cottage',
  full: 'Full-scholar'
}

const payments = [
  'downPayment',
  'secondPayment',
  'thirdPayment',
  'fourthPayment',
];

const filterByOptions = {
  accreditation: 'Accreditation',
  enrollmentType: 'Enrollment Type',
  gender: 'Gender',
  incomingGradeLevel: 'Grade Level',
  program: 'Program',
  religion: 'Religion',
  schoolYear: 'School Year',
};

const Students = ({ schoolFees, programs }) => {
  const { data, isLoading } = useStudents();
  const { data: workspaceData, isLoading: isFetchingWorkspaces } =
    useWorkspaces();
  const [isWorkspaceDataFetched, setIsWorkspaceDataFetched] = useState(false);
  // Effect to handle workspace data change
  useEffect(() => {
    if (workspaceData) {
      setIsWorkspaceDataFetched(true);
    }
  }, [workspaceData]);
  const [studentId, setStudentId] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setSubmittingState] = useState(false);
  const [showModal, setModalVisibility] = useState(false);
  const [showModal2, setModalVisibility2] = useState(false);
  const [showModal3, setModalVisibility3] = useState(false);
  const [showUpdateStudentStatusModal, setUpdateStudentStatusModalVisibility] = useState(false);
  const [filter, setFilter] = useState(['', '']);
  const [filterBy, filterValue] = filter;
  const [student, setStudent] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState(Gender.FEMALE);
  const [religion, setReligion] = useState(Religion.ROMAN_CATHOLIC);
  const [primaryGuardianName, setPrimaryGuardianName] = useState('');
  const [studentStatus, setStudentStatus] = useState('');
  const [reason, setReason] = useState('');
  const [enrollmentType, setEnrollmentType] = useState(Enrollment.NEW);
  const [incomingGradeLevel, setIncomingGradeLevel] = useState(
    GradeLevel.PRESCHOOL
  );
  const [schoolYear, setSchoolYear] = useState('');
  const [program, setProgram] = useState(Program.HOMESCHOOL_PROGRAM);
  const [cottageType, setCottageType] = useState(null);
  const [accreditation, setAccreditation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [fee, setFee] = useState(null);
  const [birthDate, setBirthDate] = useState(new Date());
  const [pictureProgress, setPictureProgress] = useState(0);
  const [birthCertificateProgress, setBirthCertificateProgress] = useState(0);
  const [reportCardProgress, setReportCardProgress] = useState(0);
  const [idPictureFrontProgress, setIdPictureFrontProgress] = useState(0);
  const [idPictureBackProgress, setIdPictureBackProgress] = useState(0);
  const [pictureLink, setPictureLink] = useState(null);
  const [birthCertificateLink, setBirthCertificateLink] = useState(null);
  const [reportCardLink, setReportCardLink] = useState(null);
  const [idPictureFrontLink, setIdPictureFrontLink] = useState(null);
  const [idPictureBackLink, setIdPictureBackLink] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [scholarship, setScholarship] = useState(null);
  const [scholarshipCode, setScholarshipCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [isSubmittingCode, setSubmittingCodeState] = useState(false);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [schoolFeeUrl, setSchoolFeeUrl] = useState('');
  const age = differenceInYears(new Date(), birthDate) || 0;
  const [showConfirmChange, setShowConfirmChange] = useState(false);
  const [isUpdatingRecord, setUpdatingRecord] = useState(false);

  const filterStudents = useMemo(() => {
    if (!filterBy || !filterValue) return data?.students;

    return data?.students?.filter(
      (student) => student[filterBy] === filterValue
    );
  }, [data, filterBy, filterValue]);

  const toggleModal = () => setModalVisibility(!showModal);
  const toggleModal2 = () => setModalVisibility2(!showModal2);
  const toggleModal3 = () => setModalVisibility3(!showModal3);
  const toggleUpdateStudentStatusModal = () => setUpdateStudentStatusModalVisibility(!showUpdateStudentStatusModal)
  const toggleConfirmChangeModal = () => {
    console.log("empty")
    setShowConfirmChange(!showConfirmChange);
  };

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

  const applyScholarship = () => {
    setSubmittingCodeState(true);
    api('/api/enroll/scholarship', {
      body: { code: scholarshipCode },
      method: 'POST',
    }).then((response) => {
      setSubmittingCodeState(false);
      console.log('errors', response.errors);
      console.log('data', response.data);
      if (response.errors) {
        setScholarship(null);
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        setScholarship(response.data);
        toast.success('Sholarship successfully applied');
      }
    });
  };

  const applyAllDiscount = () => {
    applyDiscount();
    applyScholarship();
  }

  const view = (student) => {
    toggleModal();
    setStudent(student);
    setStudentId(student.studentId);
    setIdPictureFrontLink(student.idPictureFront);
    setIdPictureBackLink(student.idPictureBack);
    //setInviteCode(student.studentId)
    if (isWorkspaceDataFetched) {
      const workspaceContainingStudent = workspaceData.workspaces.find(workspace => {
        return workspace.studentRecord && workspace.studentRecord.studentId === student.studentId;
      });

      if (workspaceContainingStudent) {
        setInviteCode(workspaceContainingStudent.inviteCode);
        setWorkspaceId(workspaceContainingStudent.id)
      } else {
        setInviteCode(''); // Reset invite code if no workspace is found
      }
    }
  };

  const viewEdit = (student) => {
    toggleModal2();
    setStudent(student);
    setFirstName(student.firstName);
    setMiddleName(student.middleName);
    setLastName(student.lastName);
    setBirthDate(new Date(student.birthDate));
    setGender(student.gender);
    setReligion(student.religion)
    setEnrollmentType(student.enrollmentType)
    setIncomingGradeLevel(student.incomingGradeLevel)
    setSchoolYear(student.schoolYear)
    setDiscountCode(student.discount)
    setBirthCertificateLink(student.liveBirthCertificate)
    setPictureLink(student.image)
    setReportCardLink(student.reportCard)
    setAccreditation(student.accreditation)
    setPayment(student.student.schoolFees[0].paymentType)
    setScholarship(student.scholarship)
    setUserId(student.student.creator.guardianInformation.userId)
    setPaymentMethod('ONLINE')
    setEmail(student.student.creator.email)
    setStudentStatus(student.studentStatus)
  };

  const viewEditSchoolFees = (student) => {
    toggleModal3();
    setStudent(student);
    setFirstName(student.firstName);
    setMiddleName(student.middleName);
    setLastName(student.lastName);
    setBirthDate(new Date(student.birthDate));
    setGender(student.gender);
    setReligion(student.religion)
    setEnrollmentType(student.enrollmentType)
    setIncomingGradeLevel(student.incomingGradeLevel)
    setSchoolYear(student.schoolYear)
    setDiscountCode(student.discount)
    setBirthCertificateLink(student.liveBirthCertificate)
    setPictureLink(student.image)
    setReportCardLink(student.reportCard)
    setAccreditation(student.accreditation)
    setPayment(student.student.schoolFees[0].paymentType)
    setScholarship(student.scholarship)
    setUserId(student.student.creator.guardianInformation.userId)
    setPaymentMethod('ONLINE')
    setEmail(student.student.creator.email)
  };

  const viewUpdateStudentStatus = (student) => {
    toggleUpdateStudentStatusModal();
    setStudent(student);
    setFirstName(student.firstName);
    setLastName(student.lastName);
    setMiddleName(student.middleName);
    setAccreditation(student.accreditation)
    setProgram(student.program)
    setBirthCertificateLink(student.liveBirthCertificate)
    setEnrollmentType(student.enrollmentType)
    setIncomingGradeLevel(student.incomingGradeLevel)
    setEmail(student.student.creator.email)
    setPrimaryGuardianName(student.student.creator.guardianInformation.primaryGuardianName)
    setCottageType(student.cottageType)
    setSchoolYear(student.schoolYear)
  };

  const editStudentRecord = (studentId) => {
    setSubmittingState(true);
    api('/api/students', {
      body: {
        studentId,
        firstName,
        middleName,
        lastName,
        gender,
        religion,
        schoolYear,
        birthDate,
        pictureLink,
        birthCertificateLink,
        reportCardLink,
        enrollmentType,
        incomingGradeLevel,
        discountCode,
        scholarshipCode,
        accreditation,
        email,
        studentStatus
      },
      method: 'PUT',
    })
      .then((response) => {
        setSubmittingState(false);
        if (response.errors) {
          Object.keys(response.errors).forEach((error) =>
            toast.error(response.errors[error].msg)
          );
        } else {
          toast.success('Student record has been updated');
          toggleModal2();
          toggleModal();
        }
      })
      .catch(() => {
        setSubmittingState(false);
        toast.error('Failed to update record');
      });
  };

  const generateNewSchoolFees = (studentId) => {
    setSubmittingState(true);
    api('/api/transactions', {
      body: {
        userId,
        email,
        workspaceId,
        payment,
        enrollmentType,
        incomingGradeLevel,
        program,
        cottageType,
        accreditation,
        paymentMethod,
        discountCode,
        scholarshipCode,
        studentId,
        monthIndex
      },
      method: 'POST',
    })
      .then(response => {
        setSubmittingState(false);
        if (response.errors) {
          Object.keys(response.errors).forEach((error) =>
            toast.error(response.errors[error].msg)
          );
        } else {
          toast.success('Generate school fees success');
          toggleModal3();
          toggleModal();
        }
      })
      .catch(error => {
        setSubmittingState(false);
        toast.error(`Error generating school fees: ${error.message}`);
      });
  };

  const updateStudentStatus = (studentId) => {
    setSubmittingState(true);
    api('/api/students/student-status', {
      body: {
        studentId,
        firstName,
        middleName,
        lastName,
        accreditation,
        enrollmentType,
        incomingGradeLevel,
        program,
        email,
        studentStatus,
        primaryGuardianName,
        cottageType,
        schoolYear
      },
      method: 'PUT',
    })
      .then(response => {
        setSubmittingState(false);
        if (response.errors) {
          Object.keys(response.errors).forEach((error) =>
            toast.error(response.errors[error].msg)
          );
        } else {
          toast.success('Update student status success');
          toggleUpdateStudentStatusModal();
          toggleModal();
        }
      })
      .catch(error => {
        setSubmittingState(false);
        toast.error(`Error generating school fees: ${error.message}`);
      });
  };

  //Get month index for calculations of monthly payments
  const [monthIndex, setMonthIndex] = useState(null);
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  useEffect(() => {
    if (schoolYear === '2024-2025') { setMonthIndex(getMonthIndex(new Date())); }
    else { setMonthIndex(getMonthIndexCurrent(new Date())); }
  }, [schoolYear]);

  useEffect(() => {
    if (accreditation !== null) {
      const programFeeByAccreditation = programFee?.tuitionFees.find(
        (tuition) => tuition.type === accreditation
      );
      setMonthlyPayment(calculateMonthlyPayment(monthIndex, programFeeByAccreditation));
    }
  }, [accreditation, programFee, monthIndex, calculateMonthlyPayment]);

  const handleAccreditationChange = (e) => {
    const selectedAccreditation = e.target.value;
    if (selectedAccreditation) {
      setAccreditation(selectedAccreditation);
    } else {
      setAccreditation(null);
    }
  };

  const handleIdPictureFrontUpload = (e, auto, studentId) => {
    const file = e.target?.files[0];

    if (file) {
      if (file.size < 5242880) { // 5MB limit
        const extension = file.name.split('.').pop();
        const storageRef = ref(
          storage,
          `files/admin/idPictureFront-${crypto
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
            setIdPictureFrontProgress(progress);
          },
          (error) => {
            toast.error(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              if (!auto) {
                setIdPictureFrontLink(downloadURL);
              } else {
                updateFile(studentId, 'idPictureFront', downloadURL);
              }
            });
          }
        );
      }
    } else {
      toast.error('File too large. Size should not exceed 5 MB.');
    }
  };

  const handleIdPictureBackUpload = (e, auto, studentId) => {
    const file = e.target?.files[0];

    if (file) {
      if (file.size < 5242880) { // 5MB limit
        const extension = file.name.split('.').pop();
        const storageRef = ref(
          storage,
          `files/admin/idPictureBack-${crypto
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
            setIdPictureBackProgress(progress);
          },
          (error) => {
            toast.error(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              if (!auto) {
                setIdPictureBackLink(downloadURL);
              } else {
                updateFile(studentId, 'idPictureBack', downloadURL);
              }
            });
          }
        );
      }
    } else {
      toast.error('File too large. Size should not exceed 5 MB.');
    }
  };

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
          case 'idPictureFront': {
            setIdPictureFrontLink(url);
            break;
          }
          case 'idPictureBack': {
            setIdPictureBackLink(url);
            break;
          }
        }
        toast.success('ID Picture uploaded successfully!');
      }
    });
  };

  const deleteStudentRecord = async (studentId, inviteCode) => {

    try {
      setUpdatingRecord(true);

      const response = await fetch('/api/students', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, inviteCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      setUpdatingRecord(false);
      toast.success('Student record has been deleted');
      toggleModal();
      toggleConfirmChangeModal();
    } catch (error) {
      setUpdatingRecord(false);
      toggleConfirmChangeModal();
      toast.error(`Error deleting student record: ${error.message}`);
    }
  }

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
      </GridToolbarContainer>
    );
  }

  const [columnVisibilityModel, setColumnVisibilityModel] = React.useState({
    birthDate: false,
    religion: false,
    homeAddress: false,
    gender: false,
    island: false,
    primaryGuardianName: false,
    primaryGuardianProfile: false,
    secondaryGuardianName: false,
    secondaryGuardianProfile: false,
    secondaryEmail: false,
    telNumber: false,
    mobileNumber: false,
    accreditation: false,

  });

  //   return (
  //     <div className="flex flex-col space-y-5 overflow-auto">
  //       <label className="text-lg font-bold" htmlFor="txtMother">
  //         Documents
  //       </label>
  //       <table className="table border border-collapse">
  //         <tbody>
  //           <tr>
  //             <td className="w-1/2 px-3 py-2 border">
  //               <h3 className="text-xl font-medium">ID Picture</h3>
  //             </td>
  //             <td className="w-1/4 px-3 py-2 border">
  //               <input
  //                 className="text-xs cursor-pointer"
  //                 accept=".jpeg,.jpg,.png"
  //                 disabled={!firstName || !lastName}
  //                 //onChange={handlePictureUpload}
  //                 type="file"
  //               />
  //               <div className="w-full mt-2 rounded-full shadow bg-grey-light">
  //                 <div
  //                   className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
  //                   style={{ width: `${pictureProgress}%` }}
  //                 >
  //                   <span className="px-3">{pictureProgress}%</span>
  //                 </div>
  //               </div>
  //             </td>
  //             <td className="w-1/4 px-3 py-2 border">
  //               <div className="flex flex-col items-center justify-center space-y-3">
  //                 {pictureLink ? (
  //                   <Link href={pictureLink}>
  //                     <a
  //                       className="text-sm text-blue-600 underline"
  //                       target="_blank"
  //                     >
  //                       Preview Image
  //                     </a>
  //                   </Link>
  //                 ) : (
  //                   <p>No file selected</p>
  //                 )}
  //               </div>
  //             </td>
  //           </tr>
  //           <tr>
  //             <td
  //               className={`w-1/2 px-3 py-2`}>
  //               <h3 className="text-xl font-medium">Birth Certificate</h3>
  //             </td>
  //             <td className="w-1/4 px-3 py-2 border">
  //               <input
  //                 className="text-xs cursor-pointer"
  //                 accept=".gif,.jpeg,.jpg,.png,.pdf"
  //                 disabled={!firstName || !lastName}
  //                 //onChange={handleBirthCertificateUpload}
  //                 type="file"
  //               />
  //               <div className="w-full mt-2 rounded-full shadow bg-grey-light">
  //                 <div
  //                   className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
  //                   style={{ width: `${birthCertificateProgress}%` }}
  //                 >
  //                   <span className="px-3">{birthCertificateProgress}%</span>
  //                 </div>
  //               </div>
  //             </td>
  //             <td className="w-1/4 px-3 py-2 border">
  //               <div className="flex flex-col items-center justify-center">
  //                 {birthCertificateLink ? (
  //                   <Link href={birthCertificateLink}>
  //                     <a
  //                       className="text-sm text-blue-600 underline"
  //                       target="_blank"
  //                     >
  //                       Preview Document
  //                     </a>
  //                   </Link>
  //                 ) : (
  //                   <p>No file selected</p>
  //                 )}
  //               </div>
  //             </td>
  //           </tr>
  //           <tr>
  //             <td className="w-1/2 px-3 py-2 border">
  //               <h3 className="text-xl font-medium">
  //                 Report Card / School Card
  //               </h3>
  //             </td>
  //             <td className="w-1/4 px-3 py-2 border">
  //               <input
  //                 className="text-xs cursor-pointer"
  //                 accept=".gif,.jpeg,.jpg,.png,.pdf"
  //                 disabled={!firstName || !lastName}
  //                 //onChange={handleReportCardUpload}
  //                 type="file"
  //               />
  //               <div className="w-full mt-2 rounded-full shadow bg-grey-light">
  //                 <div
  //                   className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
  //                   style={{ width: `${reportCardProgress}%` }}
  //                 >
  //                   <span className="px-3">{reportCardProgress}%</span>
  //                 </div>
  //               </div>
  //             </td>
  //             <td className="w-1/4 px-3 py-2 border">
  //               <div className="flex flex-col items-center justify-center">
  //                 {reportCardLink ? (
  //                   <Link href={reportCardLink}>
  //                     <a
  //                       className="text-sm text-blue-600 underline"
  //                       target="_blank"
  //                     >
  //                       Preview Document
  //                     </a>
  //                   </Link>
  //                 ) : (
  //                   <p>No file selected</p>
  //                 )}
  //               </div>
  //             </td>
  //           </tr>
  //         </tbody>
  //       </table>
  //     </div>
  //   );
  // };
  const renderEducationalBackground = () => {
    return (
      <div className="flex flex-col space-y-5 overflow-auto">
        <label className="text-lg font-bold" htmlFor="txtMother">
          Educational Background <span className="ml-1 text-red-600">*</span>
        </label>
        <div className="flex flex-row">
          <div
            className={`relative inline-block w-full rounded ${!enrollmentType ? 'border-red-500 border-2' : 'border'
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
        <hr className="border border-dashed" />
        <div className="flex flex-row space-x-5">
          <div className="flex flex-col w-full">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Incoming Grade Level <span className="ml-1 text-red-600">*</span>
            </label>
            <div className="flex flex-row">
              <div
                className={`relative inline-block w-full rounded ${!incomingGradeLevel ? 'border-red-500 border-2' : 'border'
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
        <div className="flex flex-row">
          <div
            className={`relative inline-block w-full rounded ${!schoolYear ? 'border-red-500 border-2' : 'border'
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
              <option value={SCHOOL_YEAR.SY_2025_2026}>
                {SCHOOL_YEAR.SY_2025_2026}
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
    );
  };
  const renderSchoolFees = () => {
    const programFeeByAccreditation = programFee?.tuitionFees.find(
      (tuition) => tuition.type === accreditation
    );

    return (

      <div>
        <div className="flex flex-col my-5 space-y-5 overflow-auto">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Select a Program <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="flex flex-row">
            <div
              className={`relative inline-block w-full rounded ${!program ? 'border-red-500 border-2' : 'border'
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
                  className={`relative inline-block w-full rounded ${!cottageType ? 'border-red-500 border-2' : 'border'
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
          <label className="text-lg font-bold" htmlFor="txtMother">
            Select an Accreditation <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="flex flex-row">
            <div
              className={`relative inline-block w-full rounded ${!accreditation ? 'border-red-500 border-2' : 'border'
                }`}
            >
              <select
                className="w-full px-3 py-2 capitalize rounded appearance-none"
                onChange={handleAccreditationChange}
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
          <div>
            <label className="text-lg font-bold" htmlFor="txtMother">
              Select Payment Type <span className="ml-1 text-red-600">*</span>
            </label>
            <div
              className={`relative inline-block w-full rounded ${!payment ? 'border-red-500 border-2' : 'border'
                }`}
            >
              <select
                className="w-full px-3 py-2 capitalize rounded appearance-none"
                onChange={(e) => {
                  setPayment(e.target.value ? e.target.value : null);

                  //  if (e.target.value === PaymentType.ANNUAL) {
                  //    setFee(programFeeByAccreditation?.paymentTerms[0]);
                  //  } else if (e.target.value === PaymentType.SEMI_ANNUAL) {
                  //    setFee(programFeeByAccreditation?.paymentTerms[1]);
                  //  } else if (e.target.value === PaymentType.QUARTERLY) {
                  //    setFee(programFeeByAccreditation?.paymentTerms[2]);
                  //  }
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
                <option value={PaymentType.MONTHLY}>
                  Monthly Term Payment (Initial Fee + Monthly Payment Term Fees)
                </option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDownIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-lg font-bold" htmlFor="txtMother">
              Scholarship (optional)
            </label>
            <div
              className="relative inline-block w-full rounded border"
            >
              <select
                className="w-full px-3 py-2 rounded appearance-none"
                onChange={(e) => {
                  setScholarshipCode(e.target.value ? e.target.value : null);
                }}
                value={scholarshipCode}
              >
                <option value="">Please select scholarship</option>
                <option value={scholarships.semi}>{scholarships.semi}</option>
                <option value={scholarships.semiCottage}>{scholarships.semiCottage}</option>
                <option value={scholarships.full}>{scholarships.full}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDownIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-5 overflow-auto">
          <div className="flex flex-col">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Discount Code (optional)
            </label>
            <input
              className={`px-3 py-2 rounded border-2`}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Discount Code"
              value={discountCode}
            />
            <button
              className="w-full rounded-r mt-3 bg-secondary-500 hover:bg-secondary-400"
              disabled={isSubmittingCode}
              onClick={() => {
                applyAllDiscount();

                if (payment === PaymentType.ANNUAL) {
                  setFee(programFeeByAccreditation?.paymentTerms[0]);
                } else if (payment === PaymentType.SEMI_ANNUAL) {
                  setFee(programFeeByAccreditation?.paymentTerms[1]);
                } else if (payment === PaymentType.QUARTERLY) {
                  setFee(programFeeByAccreditation?.paymentTerms[2]);
                } else if (payment === PaymentType.MONTHLY) {
                  setFee(programFeeByAccreditation?.paymentTerms[3]);
                }
              }}
            >
              Apply Discount and Scholarship
            </button>
          </div>
        </div>
        <div className="mt-5">
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
                          : fee?._type === 'fourTermPayment'
                            ? 3
                            : fee?._type === 'nineTermPayment'
                              ? monthIndex
                              : 0 // Default to 0 if none of the specified types match
                    ),
                    (_, index) => (
                      <tr key={index}>
                        <td className="px-3 py-1 border">
                          {fee?._type === 'fullTermPayment'
                            ? ''
                            : fee?._type === 'threeTermPayment'
                              ? `Three (3) Term Payment #${index + 1}`
                              : fee?._type === 'fourTermPayment'
                                ? `Four (4) Term Payment #${index + 1}`
                                : fee?._type === 'nineTermPayment'
                                  ? `Monthly Term Payment #${index + 1}`
                                  : `Unknown Payment Type #${index + 1}`}
                        </td>
                        <td className="px-3 py-1 text-right border">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'PHP',
                          }).format(
                            fee?._type === 'fullTermPayment'
                              ? 0
                              : fee?._type === 'nineTermPayment'
                                ? monthlyPayment // Render monthly payment for nineTermPayment
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
                                fee?._type === 'nineTermPayment'
                                  ? monthlyPayment - (discount?.value - fee?.downPayment) / 9
                                  : fee && fee[payments[index + 1]] -
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
                          {scholarship && (
                            <span className="text-blue-600">
                              (-
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'PHP',
                              }).format(
                                scholarship &&
                                  index < (fee?._type === 'threeTermPayment'
                                    ? 2
                                    : fee?._type === 'fourTermPayment'
                                      ? 3
                                      : fee?._type === 'nineTermPayment'
                                        ? 9
                                        : 0)
                                  ? Math.ceil(
                                    scholarship.value /
                                    (fee?._type === 'threeTermPayment'
                                      ? 2
                                      : fee?._type === 'fourTermPayment'
                                        ? 3
                                        : fee?._type === 'nineTermPayment'
                                          ? 9
                                          : 1)
                                  )
                                  : 0
                              )}
                              )
                            </span>
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
                          {`${discount
                            ? `(${Number(discount.value).toFixed(2)}${discount.type === 'VALUE' ? 'Php' : '%'
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

                  {scholarship && (
                    <tr>
                      <td className="px-3 py-1 border">
                        Total Scholarships:{' '}
                        <strong className="text-blue-600">
                          {scholarshipCode || '-'}{' '}
                          {`${scholarship
                            ? `(${Number(scholarship.value).toFixed(2)}${scholarship.type === 'VALUE' ? 'Php' : '%'
                            })`
                            : ''
                            }`}
                        </strong>
                      </td>
                      <td className="px-3 py-1 text-right text-blue-600 border">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'PHP',
                        }).format(
                          scholarship
                            ? scholarship.type === 'VALUE'
                              ? (scholarship?.code?.toLowerCase().includes('merit')
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
                                ) - scholarship.value
                                : Number(scholarship.value).toFixed(2)) * -1
                              : Math.ceil(
                                fee?._type === 'fullTermPayment'
                                  ? fee?.fullPayment
                                  : fee?.secondPayment
                              ) *
                              (scholarship.value / 100) *
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
                        ? fee?.downPayment +
                        fee?.secondPayment +
                        fee?.thirdPayment
                        : fee?._type === 'fourTermPayment'
                          ? fee?.downPayment +
                          fee?.secondPayment +
                          fee?.thirdPayment +
                          fee?.fourthPayment
                          : fee?.downPayment +
                          fee?.secondPayment +
                          fee?.thirdPayment +
                          fee?.fourthPayment +
                          fee?.fifthPayment +
                          fee?.sixthPayment +
                          fee?.seventhPayment +
                          fee?.eighthPayment +
                          fee?.ninthPayment
                  ) -
                  ((discount
                    ? discount?.type === 'VALUE'
                      ? discount?.code?.toLowerCase().includes('pastor')
                        ? Math.ceil(
                          fee?._type === 'fullTermPayment'
                            ? fee?.fullPayment
                            : fee?._type === 'threeTermPayment'
                              ? fee?.downPayment +
                              fee?.secondPayment +
                              fee?.thirdPayment
                              : fee?._type === 'fourTermPayment'
                                ? fee?.downPayment +
                                fee?.secondPayment +
                                fee?.thirdPayment +
                                fee?.fourthPayment
                                : fee?.downPayment +
                                fee?.secondPayment +
                                fee?.thirdPayment +
                                fee?.fourthPayment +
                                fee?.fifthPayment +
                                fee?.sixthPayment +
                                fee?.seventhPayment +
                                fee?.eighthPayment +
                                fee?.ninthPayment
                        ) - discount.value
                        : discount.value
                      : (discount.value / 100) *
                      (fee?._type === 'fullTermPayment'
                        ? fee?.fullPayment
                        : fee?.secondPayment)
                    : 0) +
                    (scholarship
                      ? (scholarship?.type === 'VALUE'
                        ? (scholarship?.code?.toLowerCase().includes('merit')
                          ? Math.ceil(fee?._type === 'fullTermPayment'
                            ? fee?.fullPayment
                            : fee?._type === 'threeTermPayment'
                              ? fee?.downPayment +
                              fee?.secondPayment +
                              fee?.thirdPayment
                              : fee?._type === 'fourTermPayment'
                                ? fee?.downPayment +
                                fee?.secondPayment +
                                fee?.thirdPayment +
                                fee?.fourthPayment
                                : fee?.downPayment +
                                fee?.secondPayment +
                                fee?.thirdPayment +
                                fee?.fourthPayment +
                                fee?.fifthPayment +
                                fee?.sixthPayment +
                                fee?.seventhPayment +
                                fee?.eighthPayment +
                                fee?.ninthPayment
                          ) - scholarship.value : scholarship.value)
                        : (scholarship.value / 100) * (fee?._type === 'fullTermPayment' ? fee?.fullPayment : fee?.secondPayment)) : 0))
                )}
              </span>
            </h4>
          </div>
        </div>
      </div>
    );
  };
  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Students List" />
      {/* View Student Details Modal */}
      {student && (
        <SideModal
          title={`${student.firstName} ${student.lastName}`}
          show={showModal}
          toggle={toggleModal}
        >
          <div className="space-y-5">
            <div className="flex flex-col">
              <h4 className="text-xl font-medium text-primary-500">
                {GRADE_LEVEL[student.incomingGradeLevel]}
              </h4>
              <h5 className="font-medium">
                Parent/Guardian:{' '}
                <span className="text-xs text-gray-400">
                  {
                    student.student.creator?.guardianInformation
                      ?.primaryGuardianName
                  }
                </span>
              </h5>
            </div>
            <h2 className="font-medium">Documents:</h2>
            {student.image ? (
              <div className="flex flex-col p-3 space-y-2 border rounded">
                <h3 className="text-2xl font-medium">Student Picture</h3>
                <div className="flex items-center space-x-3">
                  <Link href={student.image}>
                    <a className="underline text-primary-500" target="_blank">
                      View Student Picture
                    </a>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm">- No Image Uploaded</p>
            )}
            {student.liveBirthCertificate ? (
              <div className="flex flex-col p-3 space-y-2 border rounded">
                <h3 className="text-2xl font-medium">Birth Certificate</h3>
                <div className="flex items-center space-x-3">
                  <Link href={student.liveBirthCertificate}>
                    <a className="underline text-primary-500" target="_blank">
                      View Uploaded Document
                    </a>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm">- No Birth Certificate Uploaded</p>
            )}
            {student.reportCard ? (
              <div className="flex flex-col p-3 space-y-2 border rounded">
                <h3 className="text-2xl font-medium">Report Card</h3>
                <div className="flex items-center space-x-3">
                  <Link href={student.reportCard}>
                    <a className="underline text-primary-500" target="_blank">
                      View Uploaded Document
                    </a>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm">- No Report Card Uploaded</p>
            )}
            {/* ID Picture Front */}
            {student.idPictureFront ? (
              <div className="flex flex-col p-3 space-y-2 border rounded">
                <h3 className="text-2xl font-medium">ID Picture (Front)</h3>
                <div className="flex items-center space-x-3">
                  <Link href={student.idPictureFront}>
                    <a className="underline text-primary-500" target="_blank">
                      View ID Picture Front
                    </a>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm">- No ID Picture Front Uploaded</p>
            )}

            {/* ID Picture Back */}
            {student.idPictureBack ? (
              <div className="flex flex-col p-3 space-y-2 border rounded">
                <h3 className="text-2xl font-medium">ID Picture (Back)</h3>
                <div className="flex items-center space-x-3">
                  <Link href={student.idPictureBack}>
                    <a className="underline text-primary-500" target="_blank">
                      View ID Picture Back
                    </a>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm">- No ID Picture Back Uploaded</p>
            )}

            {/* Upload New ID Picture Front Section */}
            <div className="flex flex-col p-3 space-y-2 border rounded">
              <h3 className="text-xl font-medium">Upload New ID Picture (Front)</h3>
              <div className="flex flex-col space-y-3">
                <input
                  className="text-xs cursor-pointer"
                  accept=".jpeg,.jpg,.png"
                  onChange={(e) => handleIdPictureFrontUpload(e, true, student.studentId)}
                  type="file"
                />
                <div className="w-full rounded-full shadow bg-grey-light">
                  <div
                    className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
                    style={{ width: `${idPictureFrontProgress}%` }}
                  >
                    <span className="px-3">{idPictureFrontProgress}%</span>
                  </div>
                </div>
                {idPictureFrontLink && (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Link href={idPictureFrontLink}>
                      <a className="text-sm text-blue-600 underline" target="_blank">
                        Preview New ID Picture Front
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Upload New ID Picture Back Section */}
            <div className="flex flex-col p-3 space-y-2 border rounded">
              <h3 className="text-xl font-medium">Upload New ID Picture (Back)</h3>
              <div className="flex flex-col space-y-3">
                <input
                  className="text-xs cursor-pointer"
                  accept=".jpeg,.jpg,.png"
                  onChange={(e) => handleIdPictureBackUpload(e, true, student.studentId)}
                  type="file"
                />
                <div className="w-full rounded-full shadow bg-grey-light">
                  <div
                    className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
                    style={{ width: `${idPictureBackProgress}%` }}
                  >
                    <span className="px-3">{idPictureBackProgress}%</span>
                  </div>
                </div>
                {idPictureBackLink && (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Link href={idPictureBackLink}>
                      <a className="text-sm text-blue-600 underline" target="_blank">
                        Preview New ID Picture Back
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <hr className="border-2 border-gray-600" />
            <h2 className="font-medium">Student Details:</h2>
            <div className="flex flex-col p-3 space-y-2 border rounded">
              <h4 className="font-bold text-gray-600">Student ID</h4>
              <h3 className="font-mono font-medium text-gray-400">
                {student.studentId.toUpperCase()}
              </h3>
              <hr className="border-gray-400 border-dashed" />
              <h4 className="font-bold text-gray-600">
                Program and Accreditation
              </h4>
              <p className="text-lg">
                {PROGRAM[student.program]} -{' '}
                {ACCREDITATION[student.accreditation]}
              </p>
              <h4 className="font-bold text-gray-600">Birth Date</h4>
              <p className="text-lg">
                {format(new Date(student.birthDate), 'MMMM dd, yyyy')} (
                {differenceInYears(new Date(), new Date(student.birthDate))}{' '}
                years old )
              </p>
              <h4 className="font-bold text-gray-600">Former School</h4>
              <p className="text-lg capitalize">{student.formerSchoolName}</p>
              <p className="text-base">{student.formerSchoolAddress}</p>
              <h4 className="font-bold text-gray-600">Grade Level</h4>
              <p className="text-lg">
                {GRADE_LEVEL[student.incomingGradeLevel]}
              </p>
              <h4 className="font-bold text-gray-600">Gender</h4>
              <p className="text-lg capitalize">
                {student.gender.toLowerCase()}
              </p>
              <h4 className="font-bold text-gray-600">Religion</h4>
              <p className="text-lg capitalize">{RELIGION[student.religion]}</p>
            </div>
            <hr className="border-2 border-gray-600" />
            <h2 className="font-medium">School Fees:</h2>
            <div className="flex flex-col p-3 space-y-2 border rounded"></div>
            <div className="flex flex-col p-3 space-y-2">
              <button
                className="px-3 py-1 my-1 text-white rounded bg-red-600 hover:bg-red-400"
                onClick={() => {
                  //deleteStudentRecord(studentId, inviteCode);
                  toggleConfirmChangeModal()
                }}
              >
                delete
              </button>
              <button
                className="px-3 py-1 my-1 text-white rounded bg-primary-600 hover:bg-primary-400"
                onClick={() => {
                  viewEdit(student);
                }}
              >
                Edit Student Details
              </button>
              <button
                className="px-3 py-1 my-1 text-white rounded bg-primary-600 hover:bg-primary-400"
                onClick={() => {
                  viewEditSchoolFees(student);
                }}
              >
                Edit Student School Fees
              </button>
              <button
                className="px-3 py-1 my-1 text-white rounded bg-primary-600 hover:bg-primary-400"
                onClick={() => {
                  viewUpdateStudentStatus(student);
                }}
              >
                Update Student Status
              </button>
            </div>
          </div>
        </SideModal>
      )}
      {student && showConfirmChange === true && (
        <CenteredModal
          show={showConfirmChange}
          toggle={toggleConfirmChangeModal}
          title="Confirm Delete"
        >
          <div>
            <p className="py-1">You are about to delete <b>{student.firstName}'s</b> school fee.</p>
            <p className="mt-5">Student Records, Workspace and school fees will be deleted.</p>
            <p className="mt-5">Please note that the changes may not be undone.</p>
            <p className="mt-5">Do you wish to proceed?</p>
          </div>
          <div className="w-full flex justify-end">
            <button
              className="px-3 py-1 text-white text-base text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
              disabled={isUpdatingRecord}
              onClick={() => deleteStudentRecord(studentId, inviteCode)}
              style={{ marginRight: '0.5rem' }}
            >
              Yes
            </button>
            <button
              className="px-3 py-1 text-white text-base text-center rounded bg-gray-500 hover:bg-gray-400 disabled:opacity-25"
              disabled={isUpdatingRecord}
              onClick={toggleConfirmChangeModal}
            >
              No
            </button>
          </div>
        </CenteredModal>
      )}


      {/* Edit Student Details Modal */}
      {student && (
        <SideModal
          title={'Edit Student Details'}
          show={showModal2}
          toggle={toggleModal2}
        >
          <div className="flex flex-col space-y-3 overflow-auto">
            <div className="flex flex-col">
              <label className="text-lg font-bold" htmlFor="txtMother">
                Full Name <span className="ml-1 text-red-600">*</span>
              </label>
              <div className="flex flex-col space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
                <input
                  className={`px-3 py-2 rounded md:w-1/3 ${firstName.length <= 0 ? 'border-red-500 border-2' : 'border'
                    }`}
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
                  className={`px-3 py-2 rounded md:w-1/3 ${lastName.length <= 0 ? 'border-red-500 border-2' : 'border'
                    }`}
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
                <div
                  className={`relative flex flex-row rounded ${!birthDate ? 'border-red-500 border-2' : 'border'
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

          </div>
          {/* {renderFileUpload()} */}
          <div className="flex flex-col p-3 space-y-2">
            <button
              className="px-3 py-1 my-1 text-white rounded bg-green-600 hover:bg-green-400"
              onClick={() => {
                toast('Updating Student Details', {
                  icon: '⚠️', // Optional: you can customize the icon
                });
                editStudentRecord(studentId);
                //generateNewSchoolFees(studentId);
              }}
              disabled={isSubmitting}
            >
              Save Changes
            </button>
          </div>
        </SideModal>
      )}
      {student && (
        <SideModal
          title={'Edit Student Details'}
          show={showModal3}
          toggle={toggleModal3}
        >
          {/* {renderFileUpload()} */}
          {renderEducationalBackground()}
          {renderSchoolFees()}
          <div className="flex flex-col p-3 space-y-2">
            <button
              className="px-3 py-1 my-1 text-white rounded bg-green-600 hover:bg-green-400"
              onClick={() => {
                //editStudentRecord(studentId);
                toast('Generating new school fee(s)', {
                  icon: '⚠️', // Optional: you can customize the icon
                });
                generateNewSchoolFees(studentId);
              }}
              disabled={isSubmitting}
            >
              Save Changes
            </button>
          </div>
        </SideModal>
      )}
      {student && (
        <SideModal
          title={'Update Student Status'}
          show={showUpdateStudentStatusModal}
          toggle={toggleUpdateStudentStatusModal}
        >
          <div className="flex flex-col space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
            <div className="flex flex-col w-full">
              <h4 className="font-bold text-gray-600">Current Status: {STUDENT_STATUS[student.studentStatus]}</h4>
              <label className="text-lg font-bold  mt-2" htmlFor="txtMother">
                Student Status <span className="ml-1 text-red-600">*</span>
              </label>
              <div className="relative inline-block w-full border rounded">
                <select
                  className="w-full px-3 py-2 capitalize rounded appearance-none"
                  onChange={(e) => setStudentStatus(e.target.value)}
                  value={studentStatus}
                >
                  <option value="">Select status</option>
                  {Object.keys(STUDENT_STATUS).map((entry, index) => (
                    <option key={index} value={entry}>
                      {STUDENT_STATUS[entry]}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5" />
                </div>
              </div>
              {studentStatus === "INITIALLY_ENROLLED" && (
                <div className="flex flex-col mt-2">
                  <label className="text-lg font-bold" htmlFor="txtMother">
                    School Year <span className="ml-1 text-red-600">*</span>
                  </label>
                  <div className="flex flex-row space-x-5">
                    <input
                      className="px-3 py-2 rounded w-full border"
                      value={student.schoolYear}
                      disabled
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col p-3 space-y-2">
            <button
              className="px-3 py-1 my-1 text-white rounded bg-green-600 hover:bg-green-400"
              onClick={() => {
                //editStudentRecord(studentId);
                toast('Updating Student Status', {
                  icon: '⚠️', // Optional: you can customize the icon
                });
                updateStudentStatus(studentId);
              }}
              disabled={isSubmitting}
            >
              Save Changes
            </button>
          </div>
        </SideModal>
      )}

      <Content.Title
        title="Students List"
        subtitle="View and manage all student records and related data"
      />
      <Content.Divider />
      <Card>
        <Card.Body title="List of Enrolled Students">
          <div>
            <Link href="/account/admin/students/students-export">
              <a className="items-center px-3 py-2 space-x-2 text-sm text-white rounded bg-primary-500 hover:bg-primary-600">
                Generate Students Master List
              </a>
            </Link>
          </div>
          {/* <div className="flex flex-col md:flex-row space-y-5 py-4 md:justify-between md:items-center">
            <div className="flex flex-1 flex-col md:flex-row space-y-3 md:space-x-5 md:items-center">
              <div>Filter By:</div>
              <div className="flex flex-row md:w-1/4">
                <div className="relative inline-block w-full rounded border">
                  <select
                    className="w-full px-3 py-2 capitalize rounded appearance-none"
                    onChange={(e) => setFilter([e.target.value, ''])}
                    value={filterBy}
                  >
                    <option value="">-</option>
                    {Object.entries(filterByOptions).map(([value, name]) => (
                      <option key={value} value={value}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDownIcon className="w-5 h-5" />
                  </div>
                </div>
              </div>
              {!!filterBy && (
                <div className="flex flex-row md:w-1/4">
                  <div className="relative inline-block w-full rounded border">
                    <select
                      className="w-full px-3 py-2 capitalize rounded appearance-none"
                      onChange={(e) => setFilter([filterBy, e.target.value])}
                      value={filterValue}
                    >
                      <option value="">-</option>
                      {Object.entries(filterValueOptions[filterBy]).map(
                        ([value, name]) => (
                          <option key={value} value={value}>
                            {name}
                          </option>
                        )
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="text-2xl">Total: {filterStudents?.length || 0}</div>
          </div> */}
          <div style={{ height: 680, width: '100%' }}>
            <DataGrid
              loading={isLoading}
              rows={data ? data.students : []}
              slots={{
                toolbar: CustomToolbar,
              }}
              density="comfortable"
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={(newModel) =>
                setColumnVisibilityModel(newModel)
              }
              columns={[
                {
                  field: 'Profile',
                  hideable: true,
                  align: 'center',
                  renderCell: (params) => (
                    <div className="flex items-center justify-center w-12 h-12 overflow-hidden text-white bg-gray-400 rounded-full">
                      {params.row.image ? (
                        <div className="relative w-12 h-12 rounded-full">
                          <Image
                            alt={params.row.image}
                            className="rounded-full"
                            layout="fill"
                            loading="lazy"
                            objectFit="cover"
                            objectPosition="top"
                            src={params.row.image}
                          />
                        </div>
                      ) : (
                        <UserIcon className="w-8 h-8" />
                      )}
                    </div>
                  )
                },
                {
                  field: 'firstName',
                  headerName: 'First Name',
                  headerAlign: 'left',
                  align: 'left',
                  renderCell: (params) => (
                    <span>{params.row.firstName}</span>
                  ),
                },
                {
                  field: 'middleName',
                  headerName: 'Middle Name',
                  headerAlign: 'left',
                  align: 'left',
                  renderCell: (params) => (
                    <span>{params.row.middleName} { }</span>
                  ),
                },
                {
                  field: 'lastName',
                  headerName: 'Last Name',
                  headerAlign: 'left',
                  align: 'left',
                  renderCell: (params) => (
                    <span>{params.row.lastName}</span>
                  ),
                },
                {
                  field: 'incomingGradeLevel',
                  headerName: 'Grade Level',
                  headerAlign: 'center',
                  align: 'center',
                  renderCell: (params) => (
                    <span>
                      {GRADE_LEVEL[params.row.incomingGradeLevel]}
                    </span>
                  )
                },
                {
                  field: 'schoolYear',
                  headerName: 'School Year',
                  headerAlign: 'left',
                  align: 'left',
                  renderCell: (params) => (
                    <span className="text-xs">
                      {params.row.schoolYear}
                    </span>
                  ),
                },
                {
                  field: 'birthDate',
                  headerName: 'Birthdate',
                  headerAlign: 'center',
                  align: 'center',
                  renderCell: (params) => (
                    <span>
                      {new Date(params.row.birthDate).toLocaleDateString()}
                    </span>
                  )
                },
                {
                  field: 'gender',
                  headerName: 'Gender',
                  headerAlign: 'center',
                  align: 'center',
                  renderCell: (params) => (
                    <span>
                      {params.row.gender}
                    </span>
                  )
                },
                {
                  field: 'religion',
                  headerName: 'Religion',
                  headerAlign: 'center',
                  align: 'center',
                  renderCell: (params) => (
                    <span>
                      {params.row.religion}
                    </span>
                  )
                },
                {
                  field: 'enrollmentType',
                  headerName: 'Enrollment Type',
                  headerAlign: 'center',
                  align: 'center',
                  renderCell: (params) => (
                    <span>
                      {params.row.enrollmentType}
                    </span>
                  )
                },
                {
                  field: 'accreditation',
                  headerName: 'Accrediation',
                  headerAlign: 'center',
                  align: 'center',
                  renderCell: (params) => (
                    <span>
                      {params.row.accreditation}
                    </span>
                  )
                },
                {
                  field: 'primaryGuardianName',
                  headerName: 'Primary Guardian',
                  headerAlign: 'center',
                  align: 'center',
                  valueGetter: (params) =>
                    params.row.student.creator?.guardianInformation?.primaryGuardianName ||
                    '',
                  renderCell: (params) => (
                    <div>
                      <p className="font-medium capitalize">{params.value}</p>
                      <p className="text-sm text-gray-400 capitalize">
                        {params.row.student.creator?.guardianInformation?.primaryGuardianType?.toLowerCase()}
                      </p>
                    </div>
                  ),
                },
                {
                  field: 'primaryGuardianProfile',
                  headerName: 'Primary Guardian Profile',
                  headerAlign: 'center',
                  align: 'center',
                  valueGetter: (params) =>
                    params.row.student.creator?.guardianInformation?.primaryGuardianProfile ||
                    '',
                  renderCell: (params) => (
                    <div>
                      <p className="font-medium capitalize">{params.value}</p>
                    </div>
                  ),
                },
                {
                  field: 'secondaryGuardianName',
                  headerName: 'Secondary Guardian',
                  headerAlign: 'center',
                  align: 'center',
                  valueGetter: (params) =>
                    params.row.student.creator?.guardianInformation?.secondaryGuardianName ||
                    '',
                  renderCell: (params) => (
                    <div>
                      <p className="font-medium capitalize">{params.value}</p>
                      <p className="text-sm text-gray-400 capitalize">
                        {params.row.student.creator?.guardianInformation?.primaryGuardianType?.toLowerCase()}
                      </p>
                    </div>
                  ),
                },
                {
                  field: 'secondaryGuardianProfile',
                  headerName: 'Secondary Guardian Profile',
                  headerAlign: 'center',
                  align: 'center',
                  valueGetter: (params) =>
                    params.row.student.creator?.guardianInformation?.secondaryGuardianProfile ||
                    '',
                  renderCell: (params) => (
                    <div>
                      <p className="font-medium capitalize">{params.value}</p>
                    </div>
                  ),
                },
                {
                  field: 'homeAddress',
                  headerName: 'Home Address',
                  headerAlign: 'center',
                  align: 'center',
                  valueGetter: (params) =>
                    params.row.student.creator?.guardianInformation?.address2 ||
                    '',
                  renderCell: (params) => (
                    <span>
                      {params.row.student.creator?.guardianInformation?.address1}
                    </span>
                  )
                },
                {
                  field: 'island',
                  headerName: 'Island',
                  headerAlign: 'center',
                  align: 'center',
                  valueGetter: (params) =>
                    params.row.student.creator?.guardianInformation?.address2 ||
                    '',
                  renderCell: (params) => (
                    <span>
                      {params.row.student.creator?.guardianInformation?.address2}
                    </span>
                  )
                },
                {
                  field: 'email',
                  headerName: 'Account Email',
                  headerAlign: 'center',
                  align: 'center',
                  width: 250, // Set your desired width here
                  valueGetter: (params) =>
                    params?.row?.student.creator?.email || '',
                  renderCell: (params) => (
                    <div>
                      <span>{params?.row?.student?.creator?.email}</span>
                    </div>
                  ),
                },
                {
                  field: 'secondaryEmail',
                  headerName: 'Secondary Email',
                  headerAlign: 'center',
                  align: 'center',
                  valueGetter: (params) =>
                    params.row.student.creator?.guardianInformation?.anotherEmail ||
                    '',
                  renderCell: (params) => (
                    <div>
                      <p className="font-small">{params.row.student.creator?.guardianInformation?.anotherEmail}</p>
                    </div>
                  ),
                },
                {
                  field: 'telNumber',
                  headerName: 'Tel Number',
                  headerAlign: 'center',
                  align: 'center',
                  valueGetter: (params) =>
                    params.row.student.creator?.guardianInformation?.telephoneNumber ||
                    '',
                  renderCell: (params) => (
                    <span>
                      {params.row.student.creator?.guardianInformation?.telephoneNumber}
                    </span>
                  )
                },
                {
                  field: 'mobileNumber',
                  headerName: 'Mobile Number',
                  headerAlign: 'center',
                  align: 'center',
                  valueGetter: (params) =>
                    params.row.student.creator?.guardianInformation?.mobileNumber ||
                    '',
                  renderCell: (params) => (
                    <span>
                      {params.row.student.creator?.guardianInformation?.mobileNumber}
                    </span>
                  )
                },
                {
                  field: 'status',
                  headerName: 'Status',
                  headerAlign: 'center',
                  align: 'center',
                  valueGetter: (params) =>
                    params?.row?.studentStatus ||
                    '',
                  renderCell: (params) => (
                    <div>
                      <h4 className="flex space-x-3">
                        <span
                          className={`rounded-full py-0.5 text-xs px-2 ${ENROLLMENT_STATUS_BG_COLOR[params.row.studentStatus]
                            }`}
                        >
                          {STUDENT_STATUS[params.row?.studentStatus]}
                        </span>
                      </h4>
                    </div>
                  )
                },
                {
                  field: 'paymentStatus',
                  headerName: 'Payment Status',
                  headerAlign: 'center',
                  align: 'center',
                  valueGetter: (params) =>
                    params?.row?.studentStatus || '',
                  renderCell: (params) => {
                    const paymentStatus = params?.row?.student?.schoolFees?.[0]?.transaction?.paymentStatus;
                    const statusClass = paymentStatus ? STATUS_BG_COLOR[paymentStatus] : '';
                    const statusText = paymentStatus ? STATUS[paymentStatus] : 'N/A';

                    return (
                      <div>
                        <h4 className="flex space-x-3">
                          <span className={`rounded-full py-0.5 text-xs px-2 ${statusClass}`}>
                            {statusText}
                          </span>
                        </h4>
                      </div>
                    );
                  }
                },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  headerAlign: 'center',
                  align: 'center',
                  hide: true,
                  renderCell: (params) => (
                    <div className='center'>
                      <button
                        className="px-3 py-1 text-white rounded bg-primary-500 hover:bg-primary-400"
                        onClick={() => {
                          view(params.row);
                        }}
                      >
                        View Record
                      </button>
                      <br />
                      {/* <button
                            className="px-3 py-1 my-1 text-white rounded bg-red-600 hover:bg-primary-400"
                            onClick={() => {
                              deleteStudentRecord(params.row.studentId);
                            }}
                          >
                            delete
                          </button> */}
                      {/* <IconButton onClick={openMenu}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={closeMenu}
                      >
                        <MenuItem onClick={() => {view(params.row)}}>View Record</MenuItem>
                        <MenuItem onClick={() => {deleteStudentRecord(params.row.studentId); closeMenu();}}>
                          Delete
                        </MenuItem>
                      </Menu> */}
                    </div>
                  ),
                },

              ]}
            />
          </div>

          {/* <div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 border-t border-b border-t-gray-300 border-b-gray-300">
                  <th className="p-2 font-medium text-left">Name</th>
                  <th className="p-2 font-medium text-center">
                    Primary Guardian
                  </th>
                  <th className="p-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading ? (
                  data ? (
                    filterStudents.map((student, index) => (
                      <tr
                        key={index}
                        className="text-sm border-t border-b hover:bg-gray-100 border-b-gray-300"
                      >
                        <td className="p-2 space-x-3 text-left">
                          <div className="flex space-x-3">
                            <div className="flex items-center justify-center w-12 h-12 overflow-hidden text-white bg-gray-400 rounded-full">
                              {student.image ? (
                                <div className="relative w-12 h-12 rounded-full">
                                  <Image
                                    alt={student.image}
                                    className="rounded-full"
                                    layout="fill"
                                    loading="lazy"
                                    objectFit="cover"
                                    objectPosition="top"
                                    src={student.image}
                                  />
                                </div>
                              ) : (
                                <UserIcon className="w-8 h-8" />
                              )}
                            </div>
                            <div>
                              <h4 className="flex items-center text-xl font-medium capitalize text-primary-500">
                                <span>{`${student.firstName} ${student.lastName}`}</span>
                              </h4>
                              <h5>
                                <span className="text-xs">
                                  School Year{' '}
                                  {`${Number(student.schoolYear)} - ${
                                    Number(student.schoolYear) + 1
                                  }`}
                                </span>
                              </h5>
                              <h5 className="flex items-center font-medium text-gray-400">
                                <span className="text-xs">
                                  {GRADE_LEVEL[student.incomingGradeLevel]}
                                </span>
                              </h5>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <p className="font-medium capitalize">
                            {
                              student.student.creator?.guardianInformation
                                ?.primaryGuardianName
                            }
                          </p>
                          <p className="text-sm text-gray-400 capitalize">
                            {student.student.creator?.guardianInformation?.primaryGuardianType?.toLowerCase()}
                          </p>
                        </td>
                        <td className="p-2 space-x-2 text-xs text-center">
                          <button
                            className="px-3 py-1 text-white rounded bg-primary-500 hover:bg-primary-400"
                            onClick={() => {
                              view(student);
                            }}
                          >
                            View Record
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No records found...</td>
                    </tr>
                  )
                ) : (
                  <tr>
                    <td className="px-3 py-1 text-center" colSpan={3}>
                      Fetching records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div> */}
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export const getServerSideProps = async () => {
  const [schoolFees, programs] = await Promise.all([
    sanityClient.fetch(`*[_type == 'schoolFees']{...}`),
    sanityClient.fetch(`*[_type == 'programs']`),
  ]);
  return { props: { schoolFees, programs } };
};

export default Students;