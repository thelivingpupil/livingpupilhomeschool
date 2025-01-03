import { LandingLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import Footer from '@/sections/footer';
import Modal from '@/components/Modal';
import { InboxInIcon } from "@heroicons/react/outline";
import { useState, useEffect, createRef } from "react";
import { GRADE_LEVEL, DOCUMENT_DETAILS, STATUS_BG_COLOR, DOC_STATUS_BG_COLOR, DOC_STATUS } from '@/utils/constants';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import api from '@/lib/common/api';
import toast from 'react-hot-toast';
import { TransactionStatus } from '@prisma/client';
import { STATUS_CODES } from '@/lib/server/dragonpay';
import ReCAPTCHA from 'react-google-recaptcha';


const PURPOSE_OPTIONS = [
    { value: "", label: "Select Purpose" },
    { value: "visa", label: "VISA" },
    { value: "school-request", label: "School Request" },
    { value: "unit-district-meet", label: "Unit/District Meet" },
];


const RegistrarPortal = ({ page }) => {
    const { footer, header } = page;
    const [footerSection] = footer?.sectionType;
    const recaptchaRef = createRef();
    const [captcha, setCaptcha] = useState(null);
    const [step, setStep] = useState(0); // State to track the current step
    const [review, setReviewVisibility] = useState(false);
    const [trackingCode, setTrackingCode] = useState("");
    const [documentRequest, setDocumentRequest] = useState(null);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [selectedPurpose, setSelectedPurpose] = useState("");
    const [deliveryOption, setDeliveryOption] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [disclaimer, setDisclaimer] = useState(false);
    const [letterRequestEccd, setLetterRequestEccd] = useState("");
    const [letterRequestEccdProgress, setLetterRequestEccdProgress] = useState(0);
    const [letterRequest137, setLetterRequest137] = useState("");
    const [letterRequest137Progress, setLetterRequest137Progress] = useState(0);
    const [eccdForm, setEccdForm] = useState("");
    const [eccdFormProgress, setEccdFormProgress] = useState(0);
    const [affidavit, setAffidavit] = useState("");
    const [affidavitProgress, setAffidavitProgress] = useState(0);
    const [submittingState, setSubmittingState] = useState(false);
    const [paymentLink, setPaymentLink] = useState("")
    const [formData, setFormData] = useState({
        studentName: '',
        lrn: '',
        gradeLevel: '',
        currentSchool: '',
        gradesWithLP: '',
        lastSchoolYear: '',
    });
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
        setDeliveryAddress(""); // Reset delivery address when option is changed
        setDisclaimer(false)
    };

    // Handle change delivery disclaimer
    const handleDisclaimer = (e) => {
        setDisclaimer(e.target.value === "true"); // Convert string to boolean
    };

    // Handle input change for the delivery address
    const handleDeliveryAddressChange = (e) => {
        setDeliveryAddress(e.target.value);
    };

    const handleTrackingCodeChange = e => {
        setTrackingCode(e.target.value)
    }

    const deliveryFee = deliveryOption === "delivery" ? 200 : 0;

    // Calculating total fee including the "Document Collection" fee if Delivery is selected
    const totalFee = selectedDocuments.reduce((total, doc) => {
        return total + DOCUMENT_DETAILS[doc].fee;
    }, 0) + deliveryFee;

    const handleCheckboxChange = (document) => {
        if (document === "Permanent Record / Form 137 / SF10" && selectedDocuments.includes("ECCD")) {
            setSelectedDocuments((prev) => prev.filter((item) => item !== "ECCD"));
        } else if (document === "ECCD" && selectedDocuments.includes("Permanent Record / Form 137 / SF10")) {
            setSelectedDocuments((prev) => prev.filter((item) => item !== "Permanent Record / Form 137 / SF10"));
        } else {
            setSelectedDocuments((prev) =>
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
        setDocumentRequest(null)
    }

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
            selectedPurpose.trim() !== "") ||
        (step === 2 &&
            Object.values(formData).every((value) => value.trim() !== "")) ||
        (step === 3 &&
            Object.values(formData2).every((value) => value.trim() !== "")) ||
        (step === 4 &&
            Object.values(formData2).every((value) => value.trim() !== "")) ||
        (step === 5 &&
            (deliveryOption === "pickup" ||
                (deliveryOption === "delivery" &&
                    disclaimer === true &&
                    deliveryAddress.trim() !== "")));


    const goToStep = (nextStep) => {
        setStep(nextStep);
        document.getElementById('scroller').scroll(0, 0); // Reset scroll position
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
                    `files/${workspace.slug}/birth-${crypto
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
                    `files/${workspace.slug}/birth-${crypto
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
                    `files/${workspace.slug}/birth-${crypto
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
        api('/api/documentRequest', {
            body: {
                selectedDocuments,
                selectedPurpose,
                deliveryOption,
                deliveryAddress,
                letterRequestEccd,
                letterRequest137,
                eccdForm,
                affidavit,
                formData, // For student information
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
                    if (response.data.transactionUrl === 'N/A') {
                        setPaymentLink(response.data.transactionUrl);
                        setTrackingCode(response.data.requestCode);
                        setViewFees(true);
                        toast.success('Document request successfully submitted!');
                    } else {
                        window.open(response.data.transactionUrl, '_blank');
                        setPaymentLink(response.data.transactionUrl);
                        setTrackingCode(response.data.requestCode);
                        setViewFees(true);
                        toast.success('Document request successfully submitted!');
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
                    `files/${workspace.slug}/birth-${crypto
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
        api(`/api/documentRequest?requestCode=${trackingCode}`, {  // Use query params
            method: 'GET', // GET doesn't support body
        })
            .then((response) => {
                setSubmittingState(false);

                console.log(response)

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

    const handleTrack = () => {
        toggleReview();
        handleGetDocumentRequest();
    }
    console.log(captcha);

    const onReCAPTCHAChange = (captchaCode) => {
        if (captchaCode) {
            setCaptcha(captchaCode);
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
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 ml-20"
                        style={{ zIndex: 1000 }}
                        onClick={() => goToStep(step - 1)}
                    >
                        PREV
                    </button>
                )}


                {step < 6 && step > 0 && (
                    <button
                        className={`absolute mr-20 right-0 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-full shadow-md ${validateNext
                            ? "bg-gray-200 hover:bg-gray-300"
                            : "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                            }`}
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
                                        <span class="font-bold">LP - {documentRequest?.requestCode}</span>
                                        <span class="ml-1 mr-1">|</span>
                                        <span class={`text-sm px-2 rounded ${DOC_STATUS_BG_COLOR[documentRequest?.status]}`}>{DOC_STATUS[documentRequest?.status]}</span>
                                    </div>
                                </div>


                                <div class="">
                                    <div class="flex items-center space-x-2">
                                        <p class="font-semibold text-gray-800">Requestor:</p>
                                        <p class="text-gray-600">{documentRequest?.requestorInformation.requestorFullName}</p>
                                    </div>
                                    <div class="flex items-center mt-2 space-x-2">
                                        <p class="font-semibold text-gray-800">Email:</p>
                                        <p class="text-gray-600">{documentRequest?.requestorInformation.requestorEmail}</p>
                                    </div>
                                    <div class="flex items-center mt-2 space-x-2">
                                        <p class="font-semibold text-gray-800">Student:</p>
                                        <p class="text-gray-600">{documentRequest?.studentInformation.studentFullName}</p>
                                    </div>
                                </div>

                                <div class="mt-6">
                                    <p class="font-bold text-gray-800 mb-2">Documents:</p>
                                    <ul class="list-disc list-inside text-gray-600">
                                        {documentRequest?.documents.map((doc) => (
                                            <li key={doc.id}>
                                                {DOCUMENT_DETAILS[doc.docName]?.label} -
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
                                </div>

                                <div class="mt-6">
                                    <div class="flex items-center space-x-2">
                                        <p class="font-semibold text-gray-800">Document Collection:</p>
                                        <p class="text-gray-600">{documentRequest?.documentCollection?.charAt(0).toUpperCase() + documentRequest?.documentCollection?.slice(1).toLowerCase()}</p>
                                    </div>
                                    {documentRequest?.deliveryAddress !== "" && (
                                        <div class="flex items-center mt-2 space-x-2">
                                            <p class="font-semibold text-gray-800">Delivery Address:</p>
                                            <p class="text-gray-600">{documentRequest?.deliveryAddress}</p>
                                        </div>
                                    )}

                                    {documentRequest?.tracking !== null && (
                                        <div class="flex items-center mt-2 space-x-2">
                                            <p class="font-semibold text-gray-800">LBC Tracking Number:</p>
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
                                                    {purchase.transaction.paymentReference}
                                                </span>
                                            </h4>
                                        ) : (
                                            <h4 className="text-sm font-bold text-gray-400">
                                                Payment Reference:{' '}
                                                <span className="font-mono font-bold uppercase">
                                                    {documentRequest?.transaction.paymentReference}
                                                </span>
                                            </h4>
                                        )}
                                        {documentRequest && documentRequest?.transaction && (
                                            <span
                                                className={`rounded-full py-0.5 text-sm px-2 ${STATUS_BG_COLOR[documentRequest?.transaction.paymentStatus]
                                                    }`}
                                            >
                                                {STATUS_CODES[documentRequest?.transaction.paymentStatus]}
                                            </span>
                                        )}
                                    </div>
                                    {documentRequest?.transaction.paymentStatus !== TransactionStatus.S && (
                                        <div className='flex items-center space-x-5'>
                                            <h6>
                                                {new Intl.NumberFormat('en-PH', {
                                                    style: 'currency',
                                                    currency: 'PHP',
                                                }).format(documentRequest?.transaction?.amount || 0)}
                                            </h6>
                                            <button
                                                className="inline-block px-3 py-2 text-white rounded bg-primary-500 hover:bg-primary-400 disabled:opacity-25"
                                                disabled={submittingState}
                                                onClick={() =>
                                                    renew(
                                                        documentRequest?.transactionId,
                                                        documentRequest?.transaction.referenceNumber
                                                    )
                                                }
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
                                src="http://localhost:3000/images/livingpupil-homeschool-logo.png"
                                alt="University Logo"
                                className="w-48 mx-auto mb-10"
                            />
                            <p className="text-sm mb-2 mt-10">Please enter your Document Request/Tracking Code</p>
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
                                If you already requested and no document request code, please use your tracking code or click forgot
                                document request code. Thank you.
                            </p>
                        </div>
                    </div>

                    {/* Step 1 */}
                    <div className="w-full flex-shrink-0 flex justify-center items-center">
                        <div className="p-10 max-w-xl w-full shadow">
                            <h2 className="text-lg font-bold mb-8 text-center">Document Request Form</h2>
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
                                                    (detail.value === "form_137" && selectedDocuments.includes("eccd")) ||
                                                    (detail.value === "eccd" && selectedDocuments.includes("form_137"))
                                                }
                                            />
                                            {detail.label}
                                        </label>
                                    ))}
                                </div>

                                {/* Purpose Dropdown */}
                                <div>
                                    <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                                        Purpose
                                    </label>
                                    <select
                                        id="purpose"
                                        value={selectedPurpose}
                                        onChange={handleDropdownChange}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${selectedPurpose.length === 0 ? 'border-red-500 border-2' : 'border'}`}
                                    >
                                        {PURPOSE_OPTIONS.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div >
                        </div >
                    </div >

                    {/* Step 2 */}
                    < div className="w-full flex-shrink-0 flex justify-center items-center p-5" >
                        <div className="p-10 max-w-xl w-full shadow">
                            <h2 className="text-lg font-bold mb-4 text-center">Student Information</h2>
                            <div className="flex flex-col space-y-4">
                                {/* Student's Full Name */}
                                <div>
                                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
                                        Student's Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="studentName"
                                        value={formData.studentName}
                                        onChange={(e) => handleChange(e, setFormData)}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${!formData.studentName ? 'border-red-500 border-2' : 'border'}`}
                                        placeholder="Enter full name"
                                    />
                                </div>

                                {/* LRN */}
                                <div>
                                    <label htmlFor="lrn" className="block text-sm font-medium text-gray-700">
                                        LRN
                                    </label>
                                    <input
                                        type="text"
                                        id="lrn"
                                        value={formData.lrn}
                                        onChange={(e) => handleChange(e, setFormData)}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${!formData.lrn ? 'border-red-500 border-2' : 'border'}`}
                                        placeholder="Enter LRN"
                                    />
                                </div>

                                {/* Current Grade Level */}
                                <div>
                                    <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700">
                                        Current Grade Level
                                    </label>
                                    <select
                                        id="gradeLevel"
                                        value={formData.gradeLevel}
                                        onChange={(e) => handleChange(e, setFormData)}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${!formData.gradeLevel ? 'border-red-500 border-2' : 'border'}`}
                                    >
                                        <option value="" disabled>
                                            Select grade level
                                        </option>
                                        {Object.entries(GRADE_LEVEL).map(([key, value]) => (
                                            <option key={key} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Current School */}
                                <div>
                                    <label htmlFor="currentSchool" className="block text-sm font-medium text-gray-700">
                                        Current School
                                    </label>
                                    <input
                                        type="text"
                                        id="currentSchool"
                                        value={formData.currentSchool}
                                        onChange={(e) => handleChange(e, setFormData)}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${!formData.currentSchool ? 'border-red-500 border-2' : 'border'}`}
                                        placeholder="Enter current school"
                                    />
                                </div>

                                {/* Grade Levels Attended with Living Pupil */}
                                <div>
                                    <label htmlFor="gradesWithLP" className="block text-sm font-medium text-gray-700">
                                        Grade Levels attended with Living Pupil
                                    </label>
                                    <input
                                        type="text"
                                        id="gradesWithLP"
                                        value={formData.gradesWithLP}
                                        onChange={(e) => handleChange(e, setFormData)}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${!formData.gradesWithLP ? 'border-red-500 border-2' : 'border'}`}
                                        placeholder="Enter grade levels (e.g., 3, 4, 5)"
                                    />
                                </div>

                                {/* Last School Year with Living Pupil */}
                                <div>
                                    <label htmlFor="lastSchoolYear" className="block text-sm font-medium text-gray-700">
                                        Last School Year with Living Pupil
                                    </label>
                                    <input
                                        type="text"
                                        id="lastSchoolYear"
                                        value={formData.lastSchoolYear}
                                        onChange={(e) => handleChange(e, setFormData)}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${!formData.lastSchoolYear ? 'border-red-500 border-2' : 'border'}`}
                                        placeholder="Enter last school year"
                                    />
                                </div>
                            </div>
                        </div>
                    </div >

                    {/* Step 3 */}
                    < div className="w-full flex-shrink-0 flex justify-center items-center" >
                        <div className="p-10 max-w-xl w-full shadow">
                            <h2 className="text-lg font-bold mb-4 text-center">Requestor Information</h2>
                            <div className="flex flex-col space-y-4">
                                {/* Requestor's Full Name */}
                                <div>
                                    <label htmlFor="requestorName" className="block text-sm font-medium text-gray-700">
                                        Requestor's Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="requestorName"
                                        value={formData2.requestorName}
                                        onChange={(e) => handleChange(e, setFormData2)}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${!formData2.requestorName ? 'border-red-500 border-2' : 'border'}`}
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                {/* Relationship to the Student */}
                                <div>
                                    <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
                                        Relationship to the Student
                                    </label>
                                    <input
                                        type="text"
                                        id="relationship"
                                        value={formData2.relationship}
                                        onChange={(e) => handleChange(e, setFormData2)}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${!formData2.relationship ? 'border-red-500 border-2' : 'border'}`}
                                        placeholder="Enter your relationship (e.g., parent, guardian)"
                                    />
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData2.email}
                                        onChange={(e) => handleChange(e, setFormData2)}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${!formData2.email ? 'border-red-500 border-2' : 'border'}`}
                                        placeholder="Enter email address"
                                    />
                                </div>

                                {/* Occupation */}
                                <div>
                                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                                        Occupation
                                    </label>
                                    <input
                                        type="text"
                                        id="occupation"
                                        value={formData2.occupation}
                                        onChange={(e) => handleChange(e, setFormData2)}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${!formData2.occupation ? 'border-red-500 border-2' : 'border'}`}
                                        placeholder="Enter occupation"
                                    />
                                </div>

                                {/* Guardian's Address */}
                                <div>
                                    <label htmlFor="guardianAddress" className="block text-sm font-medium text-gray-700">
                                        Guardian's Address
                                    </label>
                                    <input
                                        type="text"
                                        id="guardianAddress"
                                        value={formData2.guardianAddress}
                                        onChange={(e) => handleChange(e, setFormData2)}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${!formData2.guardianAddress ? 'border-red-500 border-2' : 'border'}`}
                                        placeholder="Enter address"
                                    />
                                </div>

                                {/* Guardian's Mobile Number */}
                                <div>
                                    <label htmlFor="guardianMobile" className="block text-sm font-medium text-gray-700">
                                        Guardian's Mobile Number
                                    </label>
                                    <input
                                        type="text"
                                        id="guardianMobile"
                                        value={formData2.guardianMobile}
                                        onChange={(e) => handleChange(e, setFormData2)}
                                        className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${!formData2.guardianMobile ? 'border-red-500 border-2' : 'border'}`}
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                            </div>
                        </div>
                    </div >

                    {/* Step 4 */}
                    <div className="w-full flex-shrink-0 flex justify-center items-center" >
                        <div className="p-10 max-w-xl w-full shadow">
                            <h2 className="text-lg font-bold mb-4 text-center">Document Requirements</h2>
                            <div className="flex flex-col space-y-4">
                                {/* Good Moral */}
                                {selectedDocuments.some((doc) => doc === "good_moral") && (
                                    <div>
                                        <label htmlFor="email" className="block font-medium text-primary-500">
                                            Good Moral
                                        </label>
                                        <div className="ml-5 block text-sm font-medium text-gray-700">
                                            <p className="mt-2"><b>Processing Time:</b> {DOCUMENT_DETAILS.good_moral.processing_time}</p>
                                            <p className="mt-2"><b>Processing Fee:</b> ₱ {DOCUMENT_DETAILS.good_moral.fee}</p>
                                            <p className="mt-2"><b>Requirements:</b> {DOCUMENT_DETAILS.good_moral.requirement}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Report Card / Form 138 */}
                                {selectedDocuments.some((doc) => doc === "form_138") && (
                                    <div>
                                        <label htmlFor="email" className="block font-medium text-primary-500">
                                            Report Card / Form 138
                                        </label>
                                        <div className="ml-5 block text-sm font-medium text-gray-700">
                                            <p className="mt-2"><b>Processing Time:</b> {DOCUMENT_DETAILS.form_138.processing_time}</p>
                                            <p className="mt-2"><b>Processing Fee:</b> ₱ {DOCUMENT_DETAILS.form_138.fee}</p>
                                            <p className="mt-2"><b>Requirements:</b> {DOCUMENT_DETAILS.form_138.requirement}</p>
                                        </div>

                                    </div>
                                )}

                                {/* Reissuance of Report Card / Form 138 */}
                                {selectedDocuments.some((doc) => doc === "re_form_138") && (
                                    <div>
                                        <label htmlFor="email" className="block font-medium text-primary-500">
                                            Reissuance of Report Card / Form 138
                                        </label>
                                        <div className="ml-5 block text-sm font-medium text-gray-700">
                                            <p className="mt-2"><b>Processing Time:</b> {DOCUMENT_DETAILS.re_form_138.processing_time}</p>
                                            <p className="mt-2"><b>Processing Fee:</b> ₱ {DOCUMENT_DETAILS.re_form_138.fee}</p>
                                            <p className="mt-2"><b>Requirements:</b></p>
                                            <div className={`mt-2 p-1 flex flex-col ${!affidavit ? 'border-red-500 border-2' : 'border'}`}>
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
                                {selectedDocuments.some((doc) => doc === "form_137") && (
                                    <div>
                                        <label htmlFor="occupation" className="block font-medium text-primary-500">
                                            Permanent Record / Form 137 / SF10
                                        </label>
                                        <div className="ml-5 block text-sm font-medium text-gray-700">
                                            <p className="mt-2"><b>Processing Time:</b> {DOCUMENT_DETAILS.form_137.processing_time}</p>
                                            <p className="mt-2"><b>Processing Fee:</b> ₱ {DOCUMENT_DETAILS.form_137.fee}</p>
                                            <p className="mt-2"><b>Requirements:</b></p>
                                            <div className={`mt-2 p-1 flex flex-col ${!letterRequest137 ? 'border-red-500 border-2' : 'border'}`}>
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
                                                        <span className="px-3">{letterRequest137Progress}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Guardian's Address */}
                                {selectedDocuments.some((doc) => doc === "certificate_of_no_financial_obligation") && (
                                    <div>
                                        <label htmlFor="guardianAddress" className="block font-medium text-primary-500">
                                            Certificate of No Financial Obligation
                                        </label>
                                        <div className="ml-5 block text-sm font-medium text-gray-700">
                                            <p className="mt-2"><b>Processing Time:</b> {DOCUMENT_DETAILS.certificate_of_no_financial_obligation.processing_time}</p>
                                            <p className="mt-2"><b>Processing Fee:</b> ₱ {DOCUMENT_DETAILS.certificate_of_no_financial_obligation.fee}</p>
                                            <p className="mt-2"><b>Requirements:</b> {DOCUMENT_DETAILS.certificate_of_no_financial_obligation.requirement}</p>
                                        </div>
                                    </div>
                                )}
                                {/* Guardian's Mobile Number */}
                                {selectedDocuments.some((doc) => doc === "certificate_of_enrollment") && (
                                    <div>
                                        <label htmlFor="guardianMobile" className="block font-medium text-primary-500">
                                            Certificate of Enrollment
                                        </label>
                                        <div className="ml-5 block text-sm font-medium text-gray-700">
                                            <p className="mt-2"><b>Processing Time:</b> {DOCUMENT_DETAILS.certificate_of_enrollment.processing_time}</p>
                                            <p className="mt-2"><b>Processing Fee:</b> ₱ {DOCUMENT_DETAILS.certificate_of_enrollment.fee}</p>
                                            <p className="mt-2"><b>Requirements:</b> {DOCUMENT_DETAILS.certificate_of_enrollment.requirement}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Render the ECCD file input if ECCD is selected */}
                                {selectedDocuments.some((doc) => doc === "eccd") && (
                                    <div>
                                        <label htmlFor="eccdFile" className="block font-medium text-primary-500">
                                            ECCD
                                        </label>
                                        <div className="ml-5 block text-sm font-medium text-gray-700">
                                            <p className="mt-2"><b>Processing Time:</b> {DOCUMENT_DETAILS.eccd.processing_time}</p>
                                            <p className="mt-2"><b>Processing Fee:</b> ₱ {DOCUMENT_DETAILS.eccd.fee}</p>
                                            <p className="mt-2"><b>Requirements:</b></p>

                                            {/* Letter Input */}
                                            <div className={`mt-2 flex p-1 flex-col ${!letterRequestEccd ? 'border-red-500 border-2' : 'border'}`}>
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
                                                        <span className="px-3">{letterRequestEccdProgress}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Form Input */}
                                            <div className={`mt-2 p-1 flex flex-col ${!eccdForm ? 'border-red-500 border-2' : 'border'}`}>
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
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div >

                    {/* Step 5 */}
                    <div className="w-full flex-shrink-0 flex justify-center items-center">
                        <div className="p-10 max-w-xl w-full shadow">
                            <h2 className="text-lg font-bold mb-4 text-center">Document Collection</h2>

                            {/* Delivery or Pickup Selection */}
                            <div className="flex items-center mb-4">
                                <label htmlFor="deliveryOption" className="mr-4">Document Collection:</label>
                                <div className="flex gap-4">
                                    <label>
                                        <input
                                            type="radio"
                                            name="deliveryOption"
                                            value="delivery"
                                            checked={deliveryOption === "delivery"}
                                            onChange={handleDeliveryOptionChange}
                                        />
                                        Delivery
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="deliveryOption"
                                            value="pickup"
                                            checked={deliveryOption === "pickup"}
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
                                    className={`block text-sm font-medium ${deliveryOption === "pickup" ? "text-gray-400" : "text-gray-700"
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
                                    disabled={deliveryOption === "pickup"}
                                />
                            </div>

                            {/* Disclaimer Section */}
                            <div className="flex flex-col items-start mb-4">
                                <p
                                    className={`mb-2 text-sm ${deliveryOption === "pickup" ? "text-gray-400" : "text-gray-700"
                                        }`}
                                >
                                    <i>
                                        Please note that Living Pupil Homeschool is not responsible for any damages or loss that may occur during the shipping process. We recommend inspecting the package upon arrival and notifying the courier immediately if there are any issues. For lost packages, kindly coordinate directly with the courier for assistance.
                                    </i>
                                </p>
                                <label
                                    className={`flex items-center gap-2 ${deliveryOption === "pickup" ? "text-gray-400" : "text-gray-700"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="disclaimer"
                                        value="true"
                                        checked={disclaimer === true}
                                        onChange={handleDisclaimer}
                                        disabled={deliveryOption === "pickup"}
                                    />
                                    I agree.
                                </label>
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
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Document</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fee</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedDocuments.map((doc) => {
                                            const documentDetail = DOCUMENT_DETAILS[doc];
                                            return (
                                                <tr key={doc} className="border-b">
                                                    <td className="px-4 py-2 text-sm text-gray-700">{documentDetail.label}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">₱ {documentDetail.fee}</td>
                                                </tr>
                                            );
                                        })}

                                        {/* Add "Document Collection" fee if Delivery is selected */}
                                        {deliveryOption === "delivery" && (
                                            <tr>
                                                <td className="px-4 py-2 text-sm font-bold text-gray-700">Delivery Fee</td>
                                                <td className="px-4 py-2 text-sm font-bold text-gray-700">₱ 200</td>
                                            </tr>
                                        )}

                                        <tr>
                                            <td className="px-4 py-2 text-sm font-bold text-gray-700">Total:</td>
                                            <td className="px-4 py-2 text-sm font-bold text-gray-700">
                                                ₱ {totalFee}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
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
                </div >
            </div >
            {/* Footer */}
            < Footer {...footerSection} />
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
                                    <strong>Purpose:</strong>{" "}
                                    {PURPOSE_OPTIONS.find((option) => option.value === selectedPurpose)?.label || "Not Selected"}
                                </p>
                            </div>

                            <div className="mt-6">
                                <p className="font-bold text-blue-600 text-sm">Documents:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                    {selectedDocuments.map((doc) => (
                                        <li key={doc.id}>
                                            {DOCUMENT_DETAILS[doc]?.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="font-bold text-blue-600 text-sm">Student Information</p>
                                <div className="px-3 text-sm">
                                    <p><strong>Student Fullname:</strong> {formData.studentName}</p>
                                    <p><strong>LRN:</strong> {formData.lrn}</p>
                                    <p><strong>Grade Level:</strong> {formData.gradeLevel}</p>
                                    <p><strong>Current School:</strong> {formData.currentSchool}</p>
                                    <p><strong>Grades With LP:</strong> {formData.gradesWithLP}</p>
                                    <p><strong>Last School Year:</strong> {formData.lastSchoolYear}</p>
                                </div>
                            </div>

                            <div>
                                <p className="font-bold text-blue-600 text-sm">Requestor/Guardian Information</p>
                                <div className="px-3 text-sm">
                                    <p><strong>Requestor Name:</strong> {formData2.requestorName}</p>
                                    <p><strong>Relationship:</strong> {formData2.relationship}</p>
                                    <p><strong>Email:</strong> {formData2.email}</p>
                                    <p><strong>Occupation:</strong> {formData2.occupation}</p>
                                    <p><strong>Guardian Address:</strong> {formData2.guardianAddress}</p>
                                    <p><strong>Guardian Mobile:</strong> {formData2.guardianMobile}</p>
                                </div>
                            </div>

                            <div>
                                <p className="font-bold text-blue-600 text-sm">Document Collection</p>
                                <div className="px-3 text-sm">
                                    <p><strong>Delivery Option:</strong> {deliveryOption?.charAt(0).toUpperCase() + deliveryOption?.slice(1)}</p>
                                    <p><strong>Delivery Address:</strong> {deliveryOption === "pickup" ? "N/A" : deliveryAddress}</p>
                                    <p><strong>Total Fee:</strong> {new Intl.NumberFormat('en-PH', {
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
                                TRACKING CODE: <strong className='text-blue'>{trackingCode}</strong>
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

        </LandingLayout >
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
