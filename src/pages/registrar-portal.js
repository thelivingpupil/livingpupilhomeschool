import { LandingLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import Footer from '@/sections/footer';
import Modal from '@/components/Modal';
import { InboxInIcon } from '@heroicons/react/outline';
import { useState, useEffect, createRef } from 'react';
import {
  GRADE_LEVEL,
  DOCUMENT_DETAILS,
  STATUS_BG_COLOR,
  DOC_STATUS_BG_COLOR,
  DOC_STATUS,
} from '@/utils/constants';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/lib/client/firebase';
import api from '@/lib/common/api';
import toast from 'react-hot-toast';
import { TransactionStatus } from '@prisma/client';
import { STATUS_CODES } from '@/lib/server/dragonpay';
import ReCAPTCHA from 'react-google-recaptcha';
import crypto from 'crypto';
import format from 'date-fns/format';

const PURPOSE_OPTIONS = [
  { value: '', label: 'Select Purpose' },
  { value: 'visa', label: 'VISA' },
  { value: 'school-request', label: 'School Request' },
  { value: 'unit-district-meet', label: 'Unit/District Meet' },
];

const RegistrarPortal = ({ page }) => {
  const { footer, header } = page;
  const [footerSection] = footer?.sectionType;
  const recaptchaRef = createRef();
  const [captcha, setCaptcha] = useState(null);
  const [step, setStep] = useState(0); // State to track the current step
  const [review, setReviewVisibility] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [documentRequest, setDocumentRequest] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [deliveryOption, setDeliveryOption] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [disclaimer, setDisclaimer] = useState(false);
  const [letterRequestEccd, setLetterRequestEccd] = useState('');
  const [letterRequestEccdProgress, setLetterRequestEccdProgress] = useState(0);
  const [letterRequest137, setLetterRequest137] = useState('');
  const [letterRequest137Progress, setLetterRequest137Progress] = useState(0);
  const [eccdForm, setEccdForm] = useState('');
  const [eccdFormProgress, setEccdFormProgress] = useState(0);
  const [affidavit, setAffidavit] = useState('');
  const [affidavitProgress, setAffidavitProgress] = useState(0);
  const [submittingState, setSubmittingState] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [transactionId, setTransactionId] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    lrn: '',
    gradeLevel: '',
    currentSchool: '',
    gradesWithLP: '',
    lastSchoolYear: '',
  });

  // Multi-student state
  const [students, setStudents] = useState([
    {
      studentName: '',
      lrn: '',
      gradeLevel: '',
      currentSchool: '',
      gradesWithLP: '',
      lastSchoolYear: '',
      selectedDocuments: [],
    },
  ]);
  const [formData2, setFormData2] = useState({
    requestorName: '',
    relationship: '',
    email: '',
    occupation: '',
    guardianAddress: '',
    guardianMobile: '',
  });

  const handleChange = (e, formSetter) => {
    const { id, value } = e.target;
    formSetter((prev) => ({ ...prev, [id]: value }));
  };

  const toggleReview = () => setReviewVisibility(!review);

  // Handle change for Delivery or Pickup selection
  const handleDeliveryOptionChange = (e) => {
    setDeliveryOption(e.target.value);
    setDeliveryAddress(''); // Reset delivery address when option is changed
    setDisclaimer(false);
  };

  // Handle change delivery disclaimer
  const handleDisclaimer = (e) => {
    setDisclaimer(e.target.value === 'true'); // Convert string to boolean
  };

  // Handle input change for the delivery address
  const handleDeliveryAddressChange = (e) => {
    setDeliveryAddress(e.target.value);
  };

  const handleTrackingCodeChange = (e) => {
    setTrackingCode(e.target.value);
  };

  const deliveryFee = deliveryOption === 'delivery' ? 200 : 0;

  // Calculating total fee including the "Document Collection" fee if Delivery is selected
  const totalFee =
    students.reduce((total, student) => {
      return (
        total +
        student.selectedDocuments.reduce((studentTotal, doc) => {
          return studentTotal + DOCUMENT_DETAILS[doc].fee;
        }, 0)
      );
    }, 0) + deliveryFee;

  const handleCheckboxChange = (document) => {
    if (
      document === 'Permanent Record / Form 137 / SF10' &&
      selectedDocuments.includes('ECCD')
    ) {
      setSelectedDocuments((prev) => prev.filter((item) => item !== 'ECCD'));
    } else if (
      document === 'ECCD' &&
      selectedDocuments.includes('Permanent Record / Form 137 / SF10')
    ) {
      setSelectedDocuments((prev) =>
        prev.filter((item) => item !== 'Permanent Record / Form 137 / SF10')
      );
    } else {
      setSelectedDocuments(
        (prev) =>
          prev.includes(document)
            ? prev.filter((item) => item !== document) // Remove if already selected
            : [...prev, document] // Add if not selected
      );
    }
  };

  const handleDropdownChange = (event) => {
    setSelectedPurpose(event.target.value);
  };

  const handleBack = () => {
    setDocumentRequest(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Check if CAPTCHA is expired
      if (recaptchaRef.current && !recaptchaRef.current.getValue()) {
        setCaptcha(null);
      }
    }, 1000);

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  const validateNext =
    (step === 1 &&
      selectedDocuments.length > 0 &&
      selectedPurpose.trim() !== '') ||
    (step === 2 &&
      Object.values(formData).every((value) => value.trim() !== '')) ||
    (step === 3 &&
      Object.values(formData2).every((value) => value.trim() !== '')) ||
    (step === 4 &&
      (selectedDocuments.includes('form_137')
        ? letterRequest137.trim() !== ''
        : true) &&
      (selectedDocuments.includes('re_form_138')
        ? affidavit.trim() !== ''
        : true) &&
      (selectedDocuments.includes('eccd')
        ? letterRequestEccd.trim() !== '' && eccdForm.trim() !== ''
        : true)) ||
    (step === 5 &&
      (deliveryOption === 'pickup' ||
        (deliveryOption === 'delivery' &&
          disclaimer === true &&
          deliveryAddress.trim() !== '')));

  const goToStep = (nextStep) => {
    // If moving from Step 4 to Step 5, ensure the current student is added
    if (step === 4 && nextStep === 5) {
      // Save the current student data before proceeding
      saveCurrentStudent();
    }

    setStep(nextStep);
    document.getElementById('scroller').scroll(0, 0); // Reset scroll position
  };

  // Multi-student functions
  const saveCurrentStudent = () => {
    // Save the current form data as a student
    const currentStudent = {
      studentName: formData.studentName,
      lrn: formData.lrn,
      gradeLevel: formData.gradeLevel,
      currentSchool: formData.currentSchool,
      gradesWithLP: formData.gradesWithLP,
      lastSchoolYear: formData.lastSchoolYear,
      selectedDocuments: selectedDocuments,
    };

    // Check if a student with the same name already exists
    const existingStudent = students.find(
      (student) =>
        student.studentName.toLowerCase() === formData.studentName.toLowerCase()
    );

    if (existingStudent) {
      // Student with this name already exists, don't add duplicate
      toast.error(
        `A student named "${formData.studentName}" already exists in your request.`
      );
      return;
    }

    // Check if this is the first student or an additional one
    setStudents((prev) => {
      if (prev.length === 0 || !prev[0].studentName) {
        // First student or empty array, replace/add
        return [currentStudent];
      } else {
        // Additional student, add to array
        return [...prev, currentStudent];
      }
    });

    // Show success message
    toast.success(`Student "${formData.studentName}" added successfully!`);
  };

  const addStudent = () => {
    // Clear the form for the next student
    setFormData({
      studentName: '',
      lrn: '',
      gradeLevel: '',
      currentSchool: '',
      gradesWithLP: '',
      lastSchoolYear: '',
    });
    setSelectedDocuments([]);

    // Go back to Step 2 to add the next student
    setStep(2);
  };

  const removeStudent = (index) => {
    if (students.length > 1) {
      setStudents((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const editStudent = (index) => {
    // Go back to Step 2 to edit student information
    setStep(2);
    // Load the student data into the form
    const student = students[index];
    setFormData({
      studentName: student.studentName,
      lrn: student.lrn,
      gradeLevel: student.gradeLevel,
      currentSchool: student.currentSchool,
      gradesWithLP: student.gradesWithLP,
      lastSchoolYear: student.lastSchoolYear,
    });
    setSelectedDocuments(student.selectedDocuments);
  };

  useEffect(() => {
    const scroller = document.getElementById('scroller');
    if (scroller) {
      const transformValue = `translateX(-${step * 100}%)`;
      scroller.style.transform = transformValue;
    }
  }, [step]);

  const handleAffidavitUpload = (e, auto) => {
    const file = e.target?.files[0];

    if (file) {
      // 10 MB
      if (file.size < 10485760) {
        const extension = file.name.split('.').pop();
        const storageRef = ref(
          storage,
          `files/affidavit-${crypto
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
            setAffidavitProgress(progress);
          },
          (error) => {
            toast.error(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              if (!auto) {
                setAffidavit(downloadURL);
              } else {
                updateFile('affidavit', downloadURL);
              }
            });
          }
        );
      } else {
        toast.error('File too large. Size should not exceed 10 MB.');
      }
    }
  };

  const handleEccdLetterUpload = (e, auto) => {
    const file = e.target?.files[0];

    if (file) {
      // 10 MB
      if (file.size < 10485760) {
        const extension = file.name.split('.').pop();
        const storageRef = ref(
          storage,
          `files/eccdLetter-${crypto
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
            setLetterRequestEccdProgress(progress);
          },
          (error) => {
            toast.error(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              if (!auto) {
                setLetterRequestEccd(downloadURL);
              } else {
                updateFile('ECCD_Letter', downloadURL); // Adjust to remove dependency on studentId
              }
            });
          }
        );
      } else {
        toast.error('File too large. Size should not exceed 10 MB.');
      }
    }
  };
  const handleEccdFormUpload = (e, auto) => {
    const file = e.target?.files[0];

    if (file) {
      // 10 MB
      if (file.size < 10485760) {
        const extension = file.name.split('.').pop();
        const storageRef = ref(
          storage,
          `files/eccdForm-${crypto
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
            setEccdFormProgress(progress);
          },
          (error) => {
            toast.error(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              if (!auto) {
                setEccdForm(downloadURL);
              } else {
                updateFile('eccd_form', downloadURL); // Adjust to remove dependency on studentId
              }
            });
          }
        );
      } else {
        toast.error('File too large. Size should not exceed 10 MB.');
      }
    }
  };

  const submit = () => {
    setSubmittingState(true);

    // Prepare multi-student data
    let studentsData;
    let documentsData;

    if (students.length > 0 && students[0].studentName) {
      // Use saved students data
      studentsData = students.map((student) => ({
        studentFullName: student.studentName,
        lrn: student.lrn,
        currentGradeLevel: student.gradeLevel,
        currentSchool: student.currentSchool,
        gradeLevelsWithLp: student.gradesWithLP,
        lastSchoolYearWithLp: student.lastSchoolYear,
      }));

      // Prepare documents data grouped by student
      documentsData = students.map((student, index) => ({
        studentIndex: index,
        documents: student.selectedDocuments.map((docName) => ({
          docName: docName,
          url: 'N/A', // Documents will be uploaded separately
        })),
      }));
    } else {
      // Fallback to current form data (single student)
      studentsData = [
        {
          studentFullName: formData.studentName,
          lrn: formData.lrn,
          currentGradeLevel: formData.gradeLevel,
          currentSchool: formData.currentSchool,
          gradeLevelsWithLp: formData.gradesWithLP,
          lastSchoolYearWithLp: formData.lastSchoolYear,
        },
      ];

      documentsData = [
        {
          studentIndex: 0,
          documents: selectedDocuments.map((docName) => ({
            docName: docName,
            url: 'N/A', // Documents will be uploaded separately
          })),
        },
      ];
    }

    api('/api/documentRequest', {
      body: {
        selectedPurpose,
        deliveryOption,
        deliveryAddress,
        letterRequestEccd,
        letterRequest137,
        eccdForm,
        affidavit,
        students: studentsData, // Multi-student information
        documents: documentsData, // Multi-student documents
        formData2, // For requestor information
        totalFee,
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
          // ✅ Document request created successfully
          setTrackingCode(response.data.requestCode);
          toast.success('Document request successfully submitted!');

          // ✅ Open payment modal with transaction details
          if (response.data.transactionId && response.data.referenceNumber) {
            setPaymentAmount(totalFee);
            setTransactionId(response.data.transactionId);
            setReferenceNumber(response.data.referenceNumber);
            setShowPaymentModal(true);
            // Don't reset captcha immediately - let user complete it
            // setCaptcha(null);
            // if (recaptchaRef.current) {
            //     recaptchaRef.current.reset();
            // }
          }
        }
      })
      .catch(() => {
        setSubmittingState(false);
      });
  };

  const handleForm137LetterUpload = (e, auto) => {
    const file = e.target?.files[0];

    if (file) {
      // 10 MB
      if (file.size < 10485760) {
        const extension = file.name.split('.').pop();
        const storageRef = ref(
          storage,
          `files/137Letter-${crypto
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
            setLetterRequest137Progress(progress);
          },
          (error) => {
            toast.error(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              if (!auto) {
                setLetterRequest137(downloadURL);
              } else {
                updateFile('137_Letter', downloadURL); // Adjust to remove dependency on studentId
              }
            });
          }
        );
      } else {
        toast.error('File too large. Size should not exceed 10 MB.');
      }
    }
  };

  const handleGetDocumentRequest = () => {
    setSubmittingState(true);
    api(`/api/documentRequest?requestCode=${trackingCode}`, {
      // Use query params
      method: 'GET', // GET doesn't support body
    })
      .then((response) => {
        setSubmittingState(false);

        // Check the status code
        if (response.status === 200) {
          setDocumentRequest(response.data.documentRequest);
          setStep(0);
          toast.success('Document request found!');
        } else if (response.status === 404) {
          toast.error('Document request not found.');
        } else {
          toast.error('An unexpected error occurred.');
        }
      })
      .catch(() => {
        setSubmittingState(false);
        toast.error('Something went wrong. Please try again.');
      });
  };

  // Handle payment proof upload
  const handlePaymentProofUpload = async () => {
    if (!paymentProofFile || !transactionId) {
      toast.error('Please select a file and ensure transaction is available');
      return;
    }

    setUploadingProof(true);
    try {
      // Upload file to Firebase storage first
      const fileName = `payment-proof-${transactionId}-${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, paymentProofFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking if needed
        },
        (error) => {
          toast.error('Failed to upload payment proof');
          setUploadingProof(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Now send the URL to the API endpoint
          try {
            // Get current captcha token
            const currentCaptcha = recaptchaRef.current?.getValue();

            if (!currentCaptcha) {
              toast.error('Please complete the captcha verification');
              setUploadingProof(false);
              return;
            }

            const response = await api(
              '/api/documentRequest/updatePaymentProof',
              {
                method: 'POST',
                body: {
                  transactionId: transactionId,
                  paymentProofUrl: downloadURL,
                  captchaToken: currentCaptcha,
                },
              }
            );

            if (response.success) {
              toast.success('Payment proof uploaded successfully!');
              setPaymentProofFile(null);
              setShowPaymentModal(false);
            } else {
              toast.error('Failed to update payment proof');
            }
          } catch (apiError) {
            console.error('Error updating payment proof:', apiError);
            toast.error(
              'Failed to update payment proof. Please contact support.'
            );
          }
          setUploadingProof(false);
        }
      );
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      toast.error('Error uploading payment proof');
      setUploadingProof(false);
    }
  };

  const handleTrack = () => {
    toggleReview();
    handleGetDocumentRequest();
  };

  const onReCAPTCHAChange = (captchaCode) => {
    if (captchaCode) {
      setCaptcha(captchaCode);
    } else {
      setCaptcha(null);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <LandingLayout>
      {/* Header */}
      <div className="flex items-center bg-primary-500 text-white px-4 py-3">
        <InboxInIcon className="w-6 h-6 mr-2" />
        <h1 className="text-lg font-bold">Registrar Portal</h1>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Navigation Arrows */}
        {step > 0 && !review && (
          <button
            className="absolute md:left-0 md:top-1/2 md:transform md:-translate-y-1/2 bottom-4 left-4 flex items-center justify-center w-20 h-10 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 md:ml-5"
            style={{ zIndex: 1000 }}
            onClick={() => goToStep(step - 1)}
          >
            PREV
          </button>
        )}

        {step < 6 && step > 0 && (
          <button
            className={`absolute md:right-0 md:top-1/2 md:transform md:-translate-y-1/2 bottom-4 right-4 flex items-center justify-center w-20 h-10 rounded-full shadow-md ${
              validateNext
                ? 'bg-gray-200 hover:bg-gray-300'
                : 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'
            } md:mr-5`}
            style={{ zIndex: 1000 }}
            onClick={() => goToStep(step + 1)} //validateNext &&
            disabled={!validateNext}
          >
            NEXT
          </button>
        )}

        {/* Scrolling Section */}
        <div
          id="scroller"
          className="relative flex transition-transform duration-500 ease-in-out "
          style={{
            transform: `translateX(-${step * 100} %)`, // Moves content left or right based on the step
          }}
        >
          {/* Step -1 */}

          {documentRequest && (
            <div class="w-full flex-shrink-0">
              <div class="relative max-w-xl mx-auto p-10 mt-10 mb-10 shadow-lg rounded-lg overflow-hidden">
                <div class="flex items-center justify-between mb-4">
                  <div class="text-gray-800">
                    <button
                      class="flex items-center text-gray-600 hover:text-black"
                      onClick={refreshPage}
                    >
                      <span class="mr-1 text-xl">&lt;</span> BACK
                    </button>
                  </div>
                  <div class="text-gray-800">
                    <span class="px-2">Tracking Code:</span>
                    <span class="font-bold">
                      LP - {documentRequest?.requestCode}
                    </span>
                    <span class="ml-1 mr-1">|</span>
                    <span
                      class={`text-sm px-2 rounded ${
                        DOC_STATUS_BG_COLOR[documentRequest?.status]
                      }`}
                    >
                      {DOC_STATUS[documentRequest?.status]}
                    </span>
                  </div>
                </div>

                <div class="">
                  <div class="flex items-center space-x-2">
                    <p class="font-semibold text-gray-800">Requestor:</p>
                    <p class="text-gray-600">
                      {documentRequest?.requestorInformation.requestorFullName}
                    </p>
                  </div>
                  <div class="flex items-center mt-2 space-x-2">
                    <p class="font-semibold text-gray-800">Email:</p>
                    <p class="text-gray-600">
                      {documentRequest?.requestorInformation.requestorEmail}
                    </p>
                  </div>
                  {/* Students Information */}
                  <div class="mt-4">
                    <p class="font-bold text-gray-800 mb-2">Students:</p>
                    {documentRequest?.studentInformation &&
                    documentRequest.studentInformation.length > 0 ? (
                      <div class="space-y-2">
                        {documentRequest.studentInformation.map(
                          (student, index) => (
                            <div
                              key={student.id}
                              class="flex items-center space-x-2"
                            >
                              <span class="font-semibold text-gray-800">
                                Student {index + 1}:
                              </span>
                              <span class="text-gray-600">
                                {student.studentFullName || 'N/A'}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p class="text-gray-500 italic">
                        No student information available
                      </p>
                    )}
                  </div>

                  {/* Documents Section */}
                  <div class="mt-6">
                    <p class="font-bold text-gray-800 mb-2">Documents:</p>
                    {documentRequest?.documents &&
                    documentRequest.documents.length > 0 ? (
                      <ul class="list-disc list-inside text-gray-600">
                        {documentRequest.documents.map((doc) => (
                          <li key={doc.id}>
                            {DOCUMENT_DETAILS[doc.docName]?.label ||
                              doc.docName}{' '}
                            -
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="text-blue-500 underline"
                            >
                              {doc.url !== 'N/A' ? 'View Document' : 'N/A'}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p class="text-gray-500 italic">
                        No documents uploaded yet
                      </p>
                    )}
                  </div>
                </div>

                <div class="mt-6">
                  <div class="flex items-center space-x-2">
                    <p class="font-semibold text-gray-800">
                      Document Collection:
                    </p>
                    <p class="text-gray-600">
                      {documentRequest?.documentCollection
                        ?.charAt(0)
                        .toUpperCase() +
                        documentRequest?.documentCollection
                          ?.slice(1)
                          .toLowerCase()}
                    </p>
                  </div>
                  {documentRequest?.deliveryAddress !== '' && (
                    <div class="flex items-center mt-2 space-x-2">
                      <p class="font-semibold text-gray-800">
                        Delivery Address:
                      </p>
                      <p class="text-gray-600">
                        {documentRequest?.deliveryAddress}
                      </p>
                    </div>
                  )}

                  {documentRequest?.tracking !== null && (
                    <div class="flex items-center mt-2 space-x-2">
                      <p class="font-semibold text-gray-800">
                        LBC Tracking Number:
                      </p>
                      <p class="text-gray-600">{documentRequest?.tracking}</p>
                    </div>
                  )}
                </div>

                <div class="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    {documentRequest?.transaction.paymentReference ? (
                      <h4 className="text-sm font-bold text-gray-400">
                        Payment Reference:{' '}
                        <span className="font-mono font-bold uppercase">
                          {documentRequest?.transaction?.paymentReference}
                        </span>
                      </h4>
                    ) : (
                      <h4 className="text-sm font-bold text-gray-400">
                        Payment Reference:{' '}
                        <span className="font-mono font-bold uppercase">
                          {documentRequest?.transaction?.paymentReference}
                        </span>
                      </h4>
                    )}
                    {documentRequest && documentRequest?.transaction && (
                      <span
                        className={`rounded-full py-0.5 text-sm px-2 text-center ${
                          STATUS_BG_COLOR[
                            documentRequest?.transaction.paymentStatus
                          ]
                        }`}
                      >
                        {
                          STATUS_CODES[
                            documentRequest?.transaction.paymentStatus
                          ]
                        }
                      </span>
                    )}
                  </div>
                  {documentRequest?.transaction.paymentStatus !==
                    TransactionStatus.S && (
                    <div className="flex items-center space-x-5">
                      <h6>
                        {new Intl.NumberFormat('en-PH', {
                          style: 'currency',
                          currency: 'PHP',
                        }).format(documentRequest?.transaction?.amount || 0)}
                      </h6>
                      <button
                        className="inline-block px-3 py-2 text-white rounded bg-primary-500 hover:bg-primary-400 disabled:opacity-25"
                        disabled={submittingState}
                        onClick={() => {
                          // Open payment modal for existing transaction
                          setPaymentAmount(
                            documentRequest?.transaction?.amount || 0
                          );
                          setTransactionId(documentRequest?.transactionId);
                          setReferenceNumber(
                            documentRequest?.transaction?.referenceNumber
                          );
                          setShowPaymentModal(true);
                        }}
                      >
                        Pay Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 0 */}
          <div className="w-full flex-shrink-0">
            <div className="relative max-w-xl mx-auto p-10 mt-10 mb-10 shadow-lg rounded-lg overflow-hidden">
              <img
                src="https://livingpupilhomeschool.com/images/livingpupil-homeschool-logo.png"
                alt="University Logo"
                className="w-48 mx-auto mb-10"
              />
              <p className="text-sm mb-2 mt-10">
                Please enter your Document Request/Tracking Code
              </p>
              <div className="flex items-stretch mb-10">
                <div className="relative flex flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700">
                    LP -
                  </span>
                  <input
                    type="text"
                    id="trackingCode"
                    value={trackingCode}
                    onChange={(e) => handleTrackingCodeChange(e)}
                    className="pl-12 pr-3 py-2 w-full border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="Enter code"
                  />
                  <button
                    className="px-4 bg-green-600 text-white font-medium rounded-r-md hover:bg-green-700"
                    onClick={handleGetDocumentRequest}
                  >
                    Go
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mt-10 justify-center">
                <button
                  className="flex-1 px-4 py-2 bg-secondary-600 text-white font-medium rounded-md hover:bg-secondary-700"
                  onClick={() => goToStep(1)} // Go to Step 1
                >
                  Click here for new document request
                </button>
                <button className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700">
                  Forgot your document request code?
                </button>
              </div>
              <p className="mt-5 text-sm text-gray-600 mb-10">
                If you already requested and no document request code, please
                use your tracking code or click forgot document request code.
                Thank you.
              </p>
            </div>
          </div>

          {/* Step 1 */}
          <div className="w-full flex-shrink-0 flex justify-center items-center">
            <div className="p-10 max-w-xl w-full shadow">
              <h2 className="text-lg font-bold mb-8 text-center">
                Document Request Form
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Document Request For:
                </label>
                <div className="flex flex-col space-y-4 p-1 mb-2">
                  {Object.values(DOCUMENT_DETAILS).map((detail, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedDocuments.includes(detail.value)}
                        onChange={() => handleCheckboxChange(detail.value)}
                        disabled={
                          (detail.value === 'form_137' &&
                            selectedDocuments.includes('eccd')) ||
                          (detail.value === 'eccd' &&
                            selectedDocuments.includes('form_137'))
                        }
                      />
                      {detail.label}
                    </label>
                  ))}
                </div>

                {/* Purpose Dropdown */}
                <div>
                  <label
                    htmlFor="purpose"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Purpose
                  </label>
                  <select
                    id="purpose"
                    value={selectedPurpose}
                    onChange={handleDropdownChange}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      selectedPurpose.length === 0
                        ? 'border-red-500 border-2'
                        : 'border'
                    }`}
                  >
                    {PURPOSE_OPTIONS.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm mt-2">
                  <label className="font-medium text-gray-700 mt-2">
                    <strong>Important Note:</strong>
                  </label>
                  <ul className="list-disc pl-5 mt-2">
                    <li className="mt-1">
                      For Kindergarten 2 (K2) document requests, only the ECCD
                      Checklist and Report Card (Form 138) are required by
                      DepEd. Form 137 (Permanent Record) is not necessary.
                    </li>
                    <li className="mt-1">
                      Please request only the required documents to streamline
                      processing.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="w-full flex-shrink-0 flex justify-center items-center p-5">
            <div className="p-10 max-w-xl w-full shadow">
              <h2 className="text-lg font-bold mb-4 text-center">
                Student Information
              </h2>
              <p className="text-sm text-gray-600 mb-4 text-center">
                {students.length > 1
                  ? `Adding Student ${students.length}`
                  : 'Fill in the student information below'}
              </p>
              <div className="flex flex-col space-y-4">
                {/* Student's Full Name */}
                <div>
                  <label
                    htmlFor="studentName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Student's Full Name
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => handleChange(e, setFormData)}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      !formData.studentName
                        ? 'border-red-500 border-2'
                        : 'border'
                    }`}
                    placeholder="Enter full name"
                  />
                </div>

                {/* LRN */}
                <div>
                  <label
                    htmlFor="lrn"
                    className="block text-sm font-medium text-gray-700"
                  >
                    LRN
                  </label>
                  <input
                    type="text"
                    id="lrn"
                    value={formData.lrn}
                    onChange={(e) => handleChange(e, setFormData)}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      !formData.lrn ? 'border-red-500 border-2' : 'border'
                    }`}
                    placeholder="Enter LRN"
                  />
                </div>

                {/* Current Grade Level */}
                <div>
                  <label
                    htmlFor="gradeLevel"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current Grade Level
                  </label>
                  <select
                    id="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={(e) => handleChange(e, setFormData)}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      !formData.gradeLevel
                        ? 'border-red-500 border-2'
                        : 'border'
                    }`}
                  >
                    <option value="" disabled>
                      Select grade level
                    </option>
                    {Object.entries(GRADE_LEVEL).map(([key, value]) => (
                      <option
                        key={key}
                        value={value}
                        disabled={
                          selectedDocuments.includes('form_137') &&
                          (key === 'GRADE_1' ||
                            key === 'K2' ||
                            key === 'K1' ||
                            key === 'PRESCHOOL')
                        }
                      >
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current School */}
                <div>
                  <label
                    htmlFor="currentSchool"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current School
                  </label>
                  <input
                    type="text"
                    id="currentSchool"
                    value={formData.currentSchool}
                    onChange={(e) => handleChange(e, setFormData)}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      !formData.currentSchool
                        ? 'border-red-500 border-2'
                        : 'border'
                    }`}
                    placeholder="Enter current school"
                  />
                </div>

                {/* Grade Levels Attended with Living Pupil */}
                <div>
                  <label
                    htmlFor="gradesWithLP"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Grade Levels attended with Living Pupil
                  </label>
                  <input
                    type="text"
                    id="gradesWithLP"
                    value={formData.gradesWithLP}
                    onChange={(e) => handleChange(e, setFormData)}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      !formData.gradesWithLP
                        ? 'border-red-500 border-2'
                        : 'border'
                    }`}
                    placeholder="Enter grade levels (e.g., 3, 4, 5)"
                  />
                </div>

                {/* Last School Year with Living Pupil */}
                <div>
                  <label
                    htmlFor="lastSchoolYear"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last School Year with Living Pupil
                  </label>
                  <input
                    type="text"
                    id="lastSchoolYear"
                    value={formData.lastSchoolYear}
                    onChange={(e) => handleChange(e, setFormData)}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      !formData.lastSchoolYear
                        ? 'border-red-500 border-2'
                        : 'border'
                    }`}
                    placeholder="Enter last school year"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="w-full flex-shrink-0 flex justify-center items-center">
            <div className="p-10 max-w-xl w-full shadow">
              <h2 className="text-lg font-bold mb-4 text-center">
                Requestor Information
              </h2>
              <div className="flex flex-col space-y-4">
                {/* Requestor's Full Name */}
                <div>
                  <label
                    htmlFor="requestorName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Requestor's Full Name
                  </label>
                  <input
                    type="text"
                    id="requestorName"
                    value={formData2.requestorName}
                    onChange={(e) => handleChange(e, setFormData2)}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      !formData2.requestorName
                        ? 'border-red-500 border-2'
                        : 'border'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Relationship to the Student */}
                <div>
                  <label
                    htmlFor="relationship"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Relationship to the Student
                  </label>
                  <input
                    type="text"
                    id="relationship"
                    value={formData2.relationship}
                    onChange={(e) => handleChange(e, setFormData2)}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      !formData2.relationship
                        ? 'border-red-500 border-2'
                        : 'border'
                    }`}
                    placeholder="Enter your relationship (e.g., parent, guardian)"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData2.email}
                    onChange={(e) => handleChange(e, setFormData2)}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      !formData2.email ? 'border-red-500 border-2' : 'border'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>

                {/* Occupation */}
                <div>
                  <label
                    htmlFor="occupation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Occupation
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    value={formData2.occupation}
                    onChange={(e) => handleChange(e, setFormData2)}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      !formData2.occupation
                        ? 'border-red-500 border-2'
                        : 'border'
                    }`}
                    placeholder="Enter occupation"
                  />
                </div>

                {/* Guardian's Address */}
                <div>
                  <label
                    htmlFor="guardianAddress"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Guardian's Address
                  </label>
                  <input
                    type="text"
                    id="guardianAddress"
                    value={formData2.guardianAddress}
                    onChange={(e) => handleChange(e, setFormData2)}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      !formData2.guardianAddress
                        ? 'border-red-500 border-2'
                        : 'border'
                    }`}
                    placeholder="Enter address"
                  />
                </div>

                {/* Guardian's Mobile Number */}
                <div>
                  <label
                    htmlFor="guardianMobile"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Guardian's Mobile Number
                  </label>
                  <input
                    type="text"
                    id="guardianMobile"
                    value={formData2.guardianMobile}
                    onChange={(e) => handleChange(e, setFormData2)}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      !formData2.guardianMobile
                        ? 'border-red-500 border-2'
                        : 'border'
                    }`}
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="w-full flex-shrink-0 flex justify-center items-center">
            <div className="p-10 max-w-xl w-full shadow">
              <h2 className="text-lg font-bold mb-4 text-center">
                Document Requirements
              </h2>

              <div className="flex flex-col space-y-4">
                {/* Good Moral */}
                {selectedDocuments.some((doc) => doc === 'good_moral') && (
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-medium text-primary-500"
                    >
                      Good Moral
                    </label>
                    <div className="ml-5 block text-sm font-medium text-gray-700">
                      <p className="mt-2">
                        <b>Processing Time:</b>{' '}
                        {DOCUMENT_DETAILS.good_moral.processing_time}
                      </p>
                      <p className="mt-2">
                        <b>Processing Fee:</b> ₱{' '}
                        {DOCUMENT_DETAILS.good_moral.fee}
                      </p>
                      <p className="mt-2">
                        <b>Requirements:</b>{' '}
                        {DOCUMENT_DETAILS.good_moral.requirement}
                      </p>
                    </div>
                  </div>
                )}

                {/* Report Card / Form 138 */}
                {selectedDocuments.some((doc) => doc === 'form_138') && (
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-medium text-primary-500"
                    >
                      Report Card / Form 138
                    </label>
                    <div className="ml-5 block text-sm font-medium text-gray-700">
                      <p className="mt-2">
                        <b>Processing Time:</b>{' '}
                        {DOCUMENT_DETAILS.form_138.processing_time}
                      </p>
                      <p className="mt-2">
                        <b>Processing Fee:</b> ₱ {DOCUMENT_DETAILS.form_138.fee}
                      </p>
                      <p className="mt-2">
                        <b>Requirements:</b>{' '}
                        {DOCUMENT_DETAILS.form_138.requirement}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reissuance of Report Card / Form 138 */}
                {selectedDocuments.some((doc) => doc === 're_form_138') && (
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-medium text-primary-500"
                    >
                      Reissuance of Report Card / Form 138
                    </label>
                    <div className="ml-5 block text-sm font-medium text-gray-700">
                      <p className="mt-2">
                        <b>Processing Time:</b>{' '}
                        {DOCUMENT_DETAILS.re_form_138.processing_time}
                      </p>
                      <p className="mt-2">
                        <b>Processing Fee:</b> ₱{' '}
                        {DOCUMENT_DETAILS.re_form_138.fee}
                      </p>
                      <p className="mt-2">
                        <b>Requirements:</b>
                      </p>
                      <div
                        className={`mt-2 p-1 flex flex-col ${
                          !affidavit ? 'border-red-500 border-2' : 'border'
                        }`}
                      >
                        <label className="text-sm font-medium text-gray-700">
                          {DOCUMENT_DETAILS.re_form_138.requirement}
                        </label>
                        <input
                          accept=".gif,.jpeg,.jpg,.png,.pdf"
                          className="mt-2 cursor-pointer"
                          type="file"
                          onChange={handleAffidavitUpload}
                        />
                        <div className="w-full mt-2 rounded-full shadow bg-grey-light">
                          <div
                            className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
                            style={{ width: `${affidavitProgress}%` }}
                          >
                            <span className="px-3">{affidavitProgress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form 137 */}
                {selectedDocuments.some((doc) => doc === 'form_137') && (
                  <div>
                    <label
                      htmlFor="occupation"
                      className="block font-medium text-primary-500"
                    >
                      Permanent Record / Form 137 / SF10
                    </label>
                    <div className="ml-5 block text-sm font-medium text-gray-700">
                      <p className="mt-2">
                        <b>Processing Time:</b>{' '}
                        {DOCUMENT_DETAILS.form_137.processing_time}
                      </p>
                      <p className="mt-2">
                        <b>Processing Fee:</b> ₱ {DOCUMENT_DETAILS.form_137.fee}
                      </p>
                      <p className="mt-2">
                        <b>Requirements:</b>
                      </p>
                      <div
                        className={`mt-2 p-1 flex flex-col ${
                          !letterRequest137
                            ? 'border-red-500 border-2'
                            : 'border'
                        }`}
                      >
                        <label className="text-sm font-medium text-gray-700">
                          {DOCUMENT_DETAILS.form_137.requirement}
                        </label>
                        <input
                          className="mt-2 cursor-pointer"
                          accept=".gif,.jpeg,.jpg,.png,.pdf"
                          type="file"
                          onChange={handleForm137LetterUpload}
                        />
                        <div className="w-full mt-2 rounded-full shadow bg-grey-light">
                          <div
                            className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
                            style={{ width: `${letterRequest137Progress}%` }}
                          >
                            <span className="px-3">
                              {letterRequest137Progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Guardian's Address */}
                {selectedDocuments.some(
                  (doc) => doc === 'certificate_of_no_financial_obligation'
                ) && (
                  <div>
                    <label
                      htmlFor="guardianAddress"
                      className="block font-medium text-primary-500"
                    >
                      Certificate of No Financial Obligation
                    </label>
                    <div className="ml-5 block text-sm font-medium text-gray-700">
                      <p className="mt-2">
                        <b>Processing Time:</b>{' '}
                        {
                          DOCUMENT_DETAILS
                            .certificate_of_no_financial_obligation
                            .processing_time
                        }
                      </p>
                      <p className="mt-2">
                        <b>Processing Fee:</b> ₱{' '}
                        {
                          DOCUMENT_DETAILS
                            .certificate_of_no_financial_obligation.fee
                        }
                      </p>
                      <p className="mt-2">
                        <b>Requirements:</b>{' '}
                        {
                          DOCUMENT_DETAILS
                            .certificate_of_no_financial_obligation.requirement
                        }
                      </p>
                    </div>
                  </div>
                )}
                {/* Guardian's Mobile Number */}
                {selectedDocuments.some(
                  (doc) => doc === 'certificate_of_enrollment'
                ) && (
                  <div>
                    <label
                      htmlFor="guardianMobile"
                      className="block font-medium text-primary-500"
                    >
                      Certificate of Enrollment
                    </label>
                    <div className="ml-5 block text-sm font-medium text-gray-700">
                      <p className="mt-2">
                        <b>Processing Time:</b>{' '}
                        {
                          DOCUMENT_DETAILS.certificate_of_enrollment
                            .processing_time
                        }
                      </p>
                      <p className="mt-2">
                        <b>Processing Fee:</b> ₱{' '}
                        {DOCUMENT_DETAILS.certificate_of_enrollment.fee}
                      </p>
                      <p className="mt-2">
                        <b>Requirements:</b>{' '}
                        {DOCUMENT_DETAILS.certificate_of_enrollment.requirement}
                      </p>
                    </div>
                  </div>
                )}

                {/* Render the ECCD file input if ECCD is selected */}
                {selectedDocuments.some((doc) => doc === 'eccd') && (
                  <div>
                    <label
                      htmlFor="eccdFile"
                      className="block font-medium text-primary-500"
                    >
                      ECCD
                    </label>
                    <div className="ml-5 block text-sm font-medium text-gray-700">
                      <p className="mt-2">
                        <b>Processing Time:</b>{' '}
                        {DOCUMENT_DETAILS.eccd.processing_time}
                      </p>
                      <p className="mt-2">
                        <b>Processing Fee:</b> ₱ {DOCUMENT_DETAILS.eccd.fee}
                      </p>
                      <p className="mt-2">
                        <b>Requirements:</b>
                      </p>

                      {/* Letter Input */}
                      <div
                        className={`mt-2 flex p-1 flex-col ${
                          !letterRequestEccd
                            ? 'border-red-500 border-2'
                            : 'border'
                        }`}
                      >
                        <label className="text-sm font-medium text-gray-700">
                          {DOCUMENT_DETAILS.eccd.requirement.letter}
                        </label>
                        <input
                          accept=".gif,.jpeg,.jpg,.png,.pdf"
                          className="mt-2 cursor-pointer"
                          type="file"
                          onChange={handleEccdLetterUpload}
                        />
                        <div className="w-full mt-2 rounded-full shadow bg-grey-light">
                          <div
                            className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
                            style={{ width: `${letterRequestEccdProgress}%` }}
                          >
                            <span className="px-3">
                              {letterRequestEccdProgress}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Form Input */}
                      <div
                        className={`mt-2 p-1 flex flex-col mb-4 ${
                          !eccdForm ? 'border-red-500 border-2' : 'border'
                        }`}
                      >
                        <label className="text-sm font-medium text-gray-700">
                          {DOCUMENT_DETAILS.eccd.requirement.form}
                        </label>
                        <input
                          accept=".gif,.jpeg,.jpg,.png,.pdf"
                          className="mt-2 cursor-pointer"
                          type="file"
                          onChange={handleEccdFormUpload}
                        />
                        <div className="w-full mt-2 rounded-full shadow bg-grey-light">
                          <div
                            className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
                            style={{ width: `${eccdFormProgress}%` }}
                          >
                            <span className="px-3">{eccdFormProgress}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <a
                          className="inline-block w-full py-2 text-center text-white rounded bg-primary-500 hover:bg-primary-400 disabled:opacity-25 mb-4"
                          href="https://livingpupilhomeschool.com/files/eccd-form.pdf"
                          target="_blank"
                        >
                          Download ECCD Checklist
                        </a>
                      </div>
                      <div className="text-sm">
                        <label className="font-medium text-gray-700 mt-2">
                          Please refer to the digital ECCD form and follow the
                          instructions below to proceed with the request:
                        </label>
                        <ol className="list-decimal pl-5 mt-2">
                          <li className="mt-1">
                            In the "Pre" column, place a checkmark if the
                            student has already completed the described task in
                            each domain: Gross Motor, Fine Motor, Self-help,
                            Receptive Language, Expressive, Cognitive, and
                            Social-Emotional.
                          </li>
                          <li className="mt-1">
                            If the student has not yet completed the task, guide
                            her through it, then place a checkmark in the "Post"
                            column.
                          </li>
                          <li className="mt-1">
                            Kindly leave the front page of the form blank.
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="w-full flex-shrink-0 flex justify-center items-center">
            <div className="p-10 max-w-xl w-full shadow">
              <h2 className="text-lg font-bold mb-4 text-center">
                Document Collection
              </h2>

              {/* Delivery or Pickup Selection */}
              <div className="flex items-center mb-4">
                <label htmlFor="deliveryOption" className="mr-4">
                  Document Collection:
                </label>
                <div className="flex gap-4">
                  <label>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="delivery"
                      checked={deliveryOption === 'delivery'}
                      onChange={handleDeliveryOptionChange}
                    />
                    Delivery
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="pickup"
                      checked={deliveryOption === 'pickup'}
                      onChange={handleDeliveryOptionChange}
                    />
                    Pickup
                  </label>
                </div>
              </div>

              {/* Delivery Address Input */}
              <div className="mt-4 mb-4">
                <label
                  htmlFor="deliveryAddress"
                  className={`block text-sm font-medium ${
                    deliveryOption === 'pickup'
                      ? 'text-gray-400'
                      : 'text-gray-700'
                  }`}
                >
                  Delivery Address
                </label>
                <input
                  type="text"
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={handleDeliveryAddressChange}
                  className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter delivery address"
                  disabled={deliveryOption === 'pickup'}
                />
              </div>

              {/* Disclaimer Section */}
              <div className="flex flex-col items-start mb-4">
                <p
                  className={`mb-2 text-sm ${
                    deliveryOption === 'pickup'
                      ? 'text-gray-400'
                      : 'text-gray-700'
                  }`}
                >
                  <i>
                    Please note that Living Pupil Homeschool is not responsible
                    for any damages or loss that may occur during the shipping
                    process. We recommend inspecting the package upon arrival
                    and notifying the courier immediately if there are any
                    issues. For lost packages, kindly coordinate directly with
                    the courier for assistance.
                  </i>
                </p>
                <label
                  className={`flex items-center gap-2 ${
                    deliveryOption === 'pickup'
                      ? 'text-gray-400'
                      : 'text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="disclaimer"
                    value="true"
                    checked={disclaimer === true}
                    onChange={handleDisclaimer}
                    disabled={deliveryOption === 'pickup'}
                  />
                  I agree.
                </label>
              </div>

              {/* Students Summary */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Students Summary ({students.length} student
                  {students.length !== 1 ? 's' : ''})
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Total fee is calculated based on all students and their
                  selected documents. Adding more students will increase the
                  total cost.
                </p>

                <div className="space-y-3 mb-6">
                  {students.map((student, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-2">
                            Student {index + 1}:{' '}
                            {student.studentName || 'Unnamed Student'}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <strong>LRN:</strong>{' '}
                              {student.lrn || 'Not provided'}
                            </p>
                            <p>
                              <strong>Grade Level:</strong>{' '}
                              {student.gradeLevel || 'Not provided'}
                            </p>
                            <p>
                              <strong>Documents:</strong>{' '}
                              {student.selectedDocuments.length > 0
                                ? student.selectedDocuments.join(', ')
                                : 'None selected'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editStudent(index)}
                            className="px-2 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          {students.length > 1 && (
                            <button
                              onClick={() => removeStudent(index)}
                              className="px-2 py-1 text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-blue-600 mb-4">
                  💡 You can add more students in the payment step if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="w-full flex-shrink-0 flex justify-center items-center">
            <div className="p-10 max-w-xl w-full shadow">
              <h2 className="text-lg font-bold mb-4 text-center">Payment</h2>

              {/* Table to show selected documents and their fees */}
              <div className="overflow-x-auto mb-6 mt-4">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Document
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Fee
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) =>
                      student.selectedDocuments.map((doc) => {
                        const documentDetail = DOCUMENT_DETAILS[doc];
                        return (
                          <tr key={`${index}-${doc}`} className="border-b">
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {documentDetail.label} -{' '}
                              {student.studentName || `Student ${index + 1}`}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              ₱ {documentDetail.fee}
                            </td>
                          </tr>
                        );
                      })
                    )}

                    {/* Add "Document Collection" fee if Delivery is selected */}
                    {deliveryOption === 'delivery' && (
                      <tr>
                        <td className="px-4 py-2 text-sm font-bold text-gray-700">
                          Delivery Fee
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-gray-700">
                          ₱ 200
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td className="px-4 py-2 text-sm font-bold text-gray-700">
                        Total:
                      </td>
                      <td className="px-4 py-2 text-sm font-bold text-gray-700">
                        ₱ {totalFee}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Add Another Student Button */}
              <div className="mt-6 flex justify-center mb-4">
                <button
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
                  onClick={addStudent}
                >
                  + Add Another Student
                </button>
              </div>

              {/* Submit button */}
              <div className="mt-6 flex flex-col gap-4 justify-center">
                <button
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                  onClick={toggleReview} // Your handleSubmit function here
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <Footer {...footerSection} />
      <Modal
        show={review}
        toggle={toggleReview}
        title="Review Document Request Details"
      >
        <div className="max-h-[80vh] overflow-y-auto">
          {!paymentLink ? (
            <>
              <div className="mt-6">
                <p>
                  <strong>Purpose:</strong>{' '}
                  {PURPOSE_OPTIONS.find(
                    (option) => option.value === selectedPurpose
                  )?.label || 'Not Selected'}
                </p>
              </div>

              <div className="mt-6">
                <p className="font-bold text-blue-600 text-sm">
                  Documents by Student:
                </p>
                <div className="space-y-3">
                  {students.map((student, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-500 pl-3"
                    >
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Student {index + 1}: {student.studentName}
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {student.selectedDocuments.length > 0 ? (
                          student.selectedDocuments.map((doc) => (
                            <li key={doc}>{DOCUMENT_DETAILS[doc]?.label}</li>
                          ))
                        ) : (
                          <li>No documents selected</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-blue-600 text-sm">
                  Students Information
                </p>
                <div className="px-3 text-sm space-y-4">
                  {students.map((student, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-3"
                    >
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Student {index + 1}
                      </h4>
                      <p>
                        <strong>Student Fullname:</strong> {student.studentName}
                      </p>
                      <p>
                        <strong>LRN:</strong> {student.lrn}
                      </p>
                      <p>
                        <strong>Grade Level:</strong> {student.gradeLevel}
                      </p>
                      <p>
                        <strong>Current School:</strong> {student.currentSchool}
                      </p>
                      <p>
                        <strong>Grades With LP:</strong> {student.gradesWithLP}
                      </p>
                      <p>
                        <strong>Last School Year:</strong>{' '}
                        {student.lastSchoolYear}
                      </p>
                      <p>
                        <strong>Documents:</strong>{' '}
                        {student.selectedDocuments.length > 0
                          ? student.selectedDocuments.join(', ')
                          : 'None selected'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-blue-600 text-sm">
                  Requestor/Guardian Information
                </p>
                <div className="px-3 text-sm">
                  <p>
                    <strong>Requestor Name:</strong> {formData2.requestorName}
                  </p>
                  <p>
                    <strong>Relationship:</strong> {formData2.relationship}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData2.email}
                  </p>
                  <p>
                    <strong>Occupation:</strong> {formData2.occupation}
                  </p>
                  <p>
                    <strong>Guardian Address:</strong>{' '}
                    {formData2.guardianAddress}
                  </p>
                  <p>
                    <strong>Guardian Mobile:</strong> {formData2.guardianMobile}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-bold text-blue-600 text-sm">
                  Document Collection
                </p>
                <div className="px-3 text-sm">
                  <p>
                    <strong>Delivery Option:</strong>{' '}
                    {deliveryOption?.charAt(0).toUpperCase() +
                      deliveryOption?.slice(1)}
                  </p>
                  <p>
                    <strong>Delivery Address:</strong>{' '}
                    {deliveryOption === 'pickup' ? 'N/A' : deliveryAddress}
                  </p>
                  <p>
                    <strong>Total Fee:</strong>{' '}
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(totalFee || 0)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-10 mb-10 flex justify-center items-center text-center">
              <h3 className="text-lg font-bold">
                TRACKING CODE:{' '}
                <strong className="text-blue">{trackingCode}</strong>
              </h3>
            </div>
          )}

          {paymentLink ? (
            <>
              {paymentLink !== 'N/A' && (
                <a
                  className="inline-block w-full py-2 text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25 mb-4"
                  href={paymentLink}
                  target="_blank"
                >
                  Pay Now
                </a>
              )}
              <button
                className="inline-block w-full py-2 text-center text-white rounded bg-primary-500 hover:bg-primary-400 disabled:opacity-25 mb-4"
                disabled={submittingState}
                onClick={handleTrack}
              >
                Track Document Request
              </button>

              <button
                className="inline-block w-full py-2 text-center text-white rounded bg-gray-500 hover:bg-gray-400 disabled:opacity-25 mb-4"
                disabled={submittingState}
                onClick={refreshPage}
              >
                Create New Request
              </button>
            </>
          ) : (
            <div>
              <button
                className="w-full py-2 text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25 mt-4"
                disabled={submittingState || !captcha}
                onClick={submit}
              >
                {submittingState ? 'Processing...' : 'Submit & Pay Now'}
              </button>
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  className="overflow-hidden scale-75"
                  size="normal"
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={onReCAPTCHAChange}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Payment QR Modal - Same as Shop */}
      <Modal
        show={showPaymentModal}
        title="Payment Options"
        toggle={() => {
          setShowPaymentModal(false);
          // Reset captcha when closing modal
          setCaptcha(null);
          if (recaptchaRef.current) {
            recaptchaRef.current.reset();
          }
        }}
      >
        <div className="space-y-6">
          <div className="text-center bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Total Payment Amount
            </h3>
            <div className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP',
              }).format(paymentAmount)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Union Bank Option */}
            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center mb-2">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#FF7F00' }}
                  >
                    <span className="text-white text-lg font-bold">UB</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Union Bank
                </h3>
              </div>

              <div className="mt-4 text-center">
                <img
                  src="/files/qr/ub_qr.jpg"
                  alt="Union Bank QR Code"
                  className="w-64 h-64 mx-auto border border-gray-300 rounded"
                />
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/files/qr/ub_qr.jpg';
                      link.download = 'union-bank-qr.jpg';
                      link.click();
                    }}
                    className="w-full py-2 px-3 text-white rounded hover:bg-orange-600 transition-colors text-sm"
                    style={{ backgroundColor: '#FF7F00' }}
                  >
                    Download QR Code
                  </button>
                </div>
              </div>
            </div>

            {/* GCash Option */}
            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center mb-2">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#3B82F6' }}
                  >
                    <span className="text-white text-lg font-bold">GC</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">GCash</h3>
              </div>

              <div className="mt-4 text-center">
                <img
                  src="/files/qr/gcash_qr.png"
                  alt="GCash QR Code"
                  className="w-full h-64 mx-auto border border-gray-300 rounded object-contain"
                />
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/files/qr/gcash_qr.png';
                      link.download = 'gcash-qr.png';
                      link.click();
                    }}
                    className="w-full py-2 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Download QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              Payment Instructions:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>
                Choose your preferred payment method (Union Bank or GCash)
              </li>
              <li>Scan the QR code or transfer the exact amount</li>
              <li>
                Use your transaction reference number as payment description
              </li>
              <li>Keep your payment receipt for verification</li>
              <li>Upload your proof of payment using the form below</li>
              <li>Payment will be verified within 24-48 hours</li>
            </ol>
          </div>

          {/* Payment Proof Upload */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">
              Upload Payment Proof
            </h4>

            {/* Show existing payment proof if available */}
            {documentRequest?.transaction?.paymentProofLink && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">
                    ✓ Payment Proof Already Uploaded
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full text-center ${
                      STATUS_BG_COLOR[
                        documentRequest?.transaction?.paymentStatus
                      ] || 'bg-gray-200'
                    }`}
                  >
                    {STATUS_CODES[
                      documentRequest?.transaction?.paymentStatus
                    ] || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 mb-3">
                  <button
                    onClick={() =>
                      window.open(
                        documentRequest.transaction.paymentProofLink,
                        '_blank'
                      )
                    }
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    View Uploaded
                  </button>
                  <span className="text-xs text-green-600">
                    Click to view the payment proof you previously uploaded
                  </span>
                </div>
                <div className="text-xs text-green-700 border-t border-green-200 pt-2">
                  💡 You can upload a new payment proof below to replace the
                  existing one
                </div>
              </div>
            )}

            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentProofFile(e.target.files[0])}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              {paymentProofFile && (
                <div className="text-sm text-green-600">
                  ✓ {paymentProofFile.name} selected
                </div>
              )}
              <button
                onClick={handlePaymentProofUpload}
                disabled={!paymentProofFile || uploadingProof || !captcha}
                className="w-full py-2 px-4 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadingProof
                  ? 'Uploading...'
                  : documentRequest?.transaction?.paymentProofLink
                  ? 'Replace Payment Proof'
                  : 'Upload Payment Proof'}
              </button>
            </div>

            {/* Captcha verification */}
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Please verify you're human
                </p>
                {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                    onChange={onReCAPTCHAChange}
                    theme="light"
                    onExpired={() => {
                      setCaptcha(null);
                    }}
                    onError={() => {
                      setCaptcha(null);
                    }}
                  />
                )}
                {/* Debug info - remove this in production */}
                <div className="mt-2 text-xs text-gray-500">
                  Captcha Status: {captcha ? '✓ Completed' : '✗ Not completed'}
                  {!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY &&
                    ' (No site key configured)'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">
              Transaction Details:
            </h4>
            <div className="space-y-1 text-sm text-yellow-700">
              <div>
                Transaction ID:{' '}
                <span className="font-mono">{transactionId}</span>
              </div>
              <div>
                Reference Number:{' '}
                <span className="font-mono">{referenceNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowPaymentModal(false);
                handleTrack();
              }}
              className="flex-1 py-2 px-4 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
            >
              Track Document Request
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Your tracking code:{' '}
            <span className="font-mono font-bold text-primary-600">
              {trackingCode}
            </span>
          </div>
        </div>
      </Modal>
    </LandingLayout>
  );
};

export const getStaticProps = async () => {
  const [[header, footer]] = await Promise.all([
    sanityClient.fetch(
      `*[_type == 'sections' && (name == 'Common Header' || name == 'Common Footer')]`
    ),
  ]);
  return {
    props: {
      page: { footer, header },
    },
    revalidate: 10,
  };
};

export default RegistrarPortal;
