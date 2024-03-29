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
import { useStudents, useWorkspaces } from '@/hooks/data';
import { UserIcon } from '@heroicons/react/solid';
import Image from 'next/image';
import format from 'date-fns/format';
import differenceInYears from 'date-fns/differenceInYears';
import { Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { 
  DataGrid, 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarFilterButton, 
  GridToolbarDensitySelector 
} from '@mui/x-data-grid';
import toast from 'react-hot-toast';

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

const filterByOptions = {
  accreditation: 'Accreditation',
  enrollmentType: 'Enrollment Type',
  gender: 'Gender',
  incomingGradeLevel: 'Grade Level',
  program: 'Program',
  religion: 'Religion',
  schoolYear: 'School Year',
};

const Students = () => {
  const { data, isLoading } = useStudents();
  const {data: workspaceData, isLoading: isFetchingWorkspaces } =
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

  const [filter, setFilter] = useState(['', '']);

  const [filterBy, filterValue] = filter;

  const [student, setStudent] = useState(null);

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
  const [schoolYear, setSchoolYear] = useState('');
  const [formerSchoolName, setFormerSchoolName] = useState('');
  const [formerSchoolAddress, setFormerSchoolAddress] = useState('');
  const [program, setProgram] = useState(Program.HOMESCHOOL_PROGRAM);
  const [cottageType, setCottageType] = useState(null);
  const [accreditation, setAccreditation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [fee, setFee] = useState(null);
  const [birthDate, setBirthDate] = useState(new Date());
  const [pictureProgress, setPictureProgress] = useState(0);
  const [birthCertificateProgress, setBirthCertificateProgress] = useState(0);
  const [reportCardProgress, setReportCardProgress] = useState(0);
  const [pictureLink, setPictureLink] = useState(null);
  const [birthCertificateLink, setBirthCertificateLink] = useState(null);
  const [reportCardLink, setReportCardLink] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const age = differenceInYears(new Date(), birthDate) || 0;

  const filterStudents = useMemo(() => {
    if (!filterBy || !filterValue) return data?.students;

    return data?.students?.filter(
      (student) => student[filterBy] === filterValue
    );
  }, [data, filterBy, filterValue]);

  const toggleModal = () => setModalVisibility(!showModal);
  const toggleModal2 = () => setModalVisibility2(!showModal2);

  const [anchorEl, setAnchorEl] = useState(null);
  
  const openMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };

  const view = (student) => {
    toggleModal();
    setStudent(student);
    setStudentId(student.studentId)
    //setInviteCode(student.studentId)
    if (isWorkspaceDataFetched) {
            const workspaceContainingStudent = workspaceData.workspaces.find(workspace => {
                return workspace.studentRecord && workspace.studentRecord.studentId === student.studentId;
            });

            if (workspaceContainingStudent) {
                setInviteCode(workspaceContainingStudent.inviteCode);
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
    setFormerSchoolName(student.formerSchoolName)
    setFormerSchoolAddress(student.formerSchoolAddress)
    setDiscountCode(student.discount)
    setBirthCertificateLink(student.liveBirthCertificate)
    setPictureLink(student.image)
    setPictureLink(student.reportCard)
  };
  
  const editStudentRecord = async (studentId) => {
    console.log(studentId);
    try {
     setSubmittingState(true);

     const response = await fetch('/api/students', {
       method: 'PUT',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ 
        studentId, 
        firstName,
        middleName,
        lastName,
        gender,
        religion,
        enrollmentType,
        incomingGradeLevel,
        schoolYear,
        birthDate,
        pictureLink,
        birthCertificateLink,
        reportCardLink,
        //discountCode,
      }),
     });

     if (!response.ok) {
       throw new Error('Failed to update record');
     }

     setSubmittingState(false);
     toast.success('Student record has been updated');
     toggleModal2();
     toggleModal();
   } catch (error) {
     setSubmittingState(false);
     toast.error(`Error updating student record: ${error.message}`);
   }
  }
  
  const deleteStudentRecord = async (studentId, inviteCode) => {

     try {
     setSubmittingState(true);

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

     setSubmittingState(false);
     toast.success('Student record has been deleted');
     toggleModal();
   } catch (error) {
     setSubmittingState(false);
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
    birthDate:false,
    religion:false,
    homeAddress:false,
    gender: false,
    island: false,
    primaryGuardianName:false,
    primaryGuardianProfile:false,
    secondaryGuardianName: false,
    secondaryGuardianProfile:false,
    secondaryEmail: false,
    telNumber: false,
    mobileNumber: false,
    accreditation: false,

  });

  // const renderFileUpload = () => {
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
    );
  };
  const renderSchoolFees = () => {
    return (
      <div className="flex flex-col space-y-5 overflow-auto">
        
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Discount Code
          </label>
          <input
            className={`px-3 py-2 rounded border-2`}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Discount Code"
            value={discountCode}
          />
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
                      deleteStudentRecord(studentId, inviteCode);
                      //console.log('invite:' + inviteCode + ' ID:' + studentId)
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
            </div>
          </div>
        </SideModal>
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
                className={`px-3 py-2 rounded md:w-1/3 ${
                  firstName.length <= 0 ? 'border-red-500 border-2' : 'border'
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
                className={`px-3 py-2 rounded md:w-1/3 ${
                  lastName.length <= 0 ? 'border-red-500 border-2' : 'border'
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
        {renderEducationalBackground()}
        {/* {renderSchoolFees()} */}
        <div className="flex flex-col p-3 space-y-2">
                  <button
                    className="px-3 py-1 my-1 text-white rounded bg-green-600 hover:bg-green-400"
                    onClick={() => {
                      editStudentRecord(studentId);
                    }}
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
                    <span>{params.row.middleName} {}</span>
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
                  renderCell: (params) =>(                    
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
                  renderCell: (params) =>(                    
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
                  renderCell: (params) =>(                    
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
                  renderCell: (params) =>(                    
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
                  renderCell: (params) =>(                    
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
                  renderCell: (params) =>(                    
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
                  renderCell: (params) =>(                    
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
                  renderCell: (params) =>(                    
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
                  valueGetter: (params) =>
                    params.row.student.creator?.email ||
                    '',
                  renderCell: (params) => (
                    <div>
                      <span >{params.row.student.creator?.email}school</span>
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
                  renderCell: (params) =>(                    
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
                  renderCell: (params) =>(                    
                    <span>
                      {params.row.student.creator?.guardianInformation?.mobileNumber}
                    </span>                     
                  )
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
                          <br/>
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

export default Students;
