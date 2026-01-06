import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic'; // Use dynamic import for ReactQuill to avoid SSR issues
import Meta from '@/components/Meta';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import { GRADE_LEVEL, GRADE_LEVEL_GROUPS, GRADE_LEVEL_FORMS, ACCREDITATION_NEW, PROGRAM } from '@/utils/constants';
import { useStudents } from '@/hooks/data';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/lib/client/firebase';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import { getSenderDetails, getSenderCredentials } from '@/utils/index';
import { html as announcementHtml } from '@/config/email-templates/broadcast/announcement';
import crypto from 'crypto';
import format from 'date-fns/format';

// Dynamically import ReactQuill to avoid SSR (Server-Side Rendering) issues
const ReactQuill = dynamic(
    async () => {
        const ReactQuillModule = await import('react-quill');
        const ImageResize = await import('quill-image-resize');

        // Get Quill from ReactQuill
        const Quill = ReactQuillModule.Quill || ReactQuillModule.default?.Quill;

        // Register image resize module
        if (Quill && !Quill.imports['modules/imageResize']) {
            try {
                Quill.register('modules/imageResize', ImageResize.default);
            } catch (error) {
                // Image resize registration failed, continue without it
            }
        }

        return ReactQuillModule;
    },
    { ssr: false }
);
import 'react-quill/dist/quill.snow.css';

// Filter options
const filterOptions = {
    gradeForms: 'Grade Forms',
    gradeLevels: 'Grade Level',
    gradeGroups: 'Grade Groups',
};

// Email sender options
const emailSenderOptions = [
    { value: 'finance', label: 'Finance' },
    { value: 'admin', label: 'Admin' },
    { value: 'shop', label: 'Shop' },
    { value: 'coo', label: 'COO' },
    { value: 'directress', label: 'Directress' },
    { value: 'cottage', label: 'Cottage Coordinator' },
    { value: 'international', label: 'International Coordinator' },
];

// Constant for singular email
const singularEmailOption = { value: 'single', label: 'Single Email' };


const Broadcast = () => {
    const { data: studentsData, isLoading } = useStudents();
    const [filterBy, setFilterBy] = useState('');
    const [filterValues, setFilterValues] = useState([]); // Allow multiple selections for grade levels, grade groups, and forms
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [guardianEmails, setGuardianEmails] = useState([]);
    const [emailContent, setEmailContent] = useState(''); // Rich text editor content
    const [emailSender, setEmailSender] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [program, setProgram] = useState([]); // Updated to be an array
    const [accreditation, setAccreditation] = useState([]); // Updated to be an array
    const [emailSendType, setEmailSendType] = useState('auto'); // State to determine single or multiple emails
    const [singularEmail, setSingularEmail] = useState(''); // State for singular email input
    const [singularParent, setSingularParent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false); // Track form validity
    const [attachments, setAttachments] = useState([]);
    const [ccEmails, setCcEmails] = useState([]); // State for CC emails
    const [ccInput, setCcInput] = useState(''); // State for input field
    const [schoolYear, setSchoolYear] = useState('');
    const [showPreview, setShowPreview] = useState(false); // State for preview modal
    const [previewContent, setPreviewContent] = useState(''); // State for preview HTML
    const [isProcessingPreview, setIsProcessingPreview] = useState(false); // State for preview processing
    const [isUploadingImage, setIsUploadingImage] = useState(false); // State for image upload
    const [testEmail, setTestEmail] = useState(''); // State for test email address
    const [testEmailSubject, setTestEmailSubject] = useState(''); // State for test email subject
    const [testEmailSender, setTestEmailSender] = useState(''); // State for test email sender
    const [isSendingTestEmail, setIsSendingTestEmail] = useState(false); // State for sending test email
    const quillRef = useRef(null); // Ref for ReactQuill instance
    const quillEditorRef = useRef(null); // Ref to store the Quill editor instance directly
    const handleContentChangeRef = useRef(null); // Ref for handleContentChange to access in memoized function

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setAttachments(files); // Store selected files in the state
    };

    const handleSchoolYearChange = (e) => {
        setSchoolYear(e.target.value);
    }

    const filterEnrolledStudents = (studentsData, schoolYear) => {
        return studentsData.students.filter(student =>
            student.schoolYear === schoolYear &&
            student.student.schoolFees[0]?.transaction.paymentStatus === "S"
        );
    };

    // Handle checkbox changes for multiple selections
    const handleCheckboxChange = (e, setStateFunc) => {
        const { value, checked } = e.target;
        if (checked) {
            setStateFunc((prev) => [...prev, value]); // Add selected value
        } else {
            setStateFunc((prev) => prev.filter((v) => v !== value)); // Remove unselected value
        }
    };

    // Handle checkbox change for Program
    const handleCheckboxChangeForProgram = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setProgram((prev) => [...prev, value]); // Add selected program
        } else {
            setProgram((prev) => prev.filter((v) => v !== value)); // Remove unselected program
        }
    };


    // Handle checkbox change for Accreditation
    const handleCheckboxChangeForAccreditation = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setAccreditation((prev) => [...prev, value]); // Add selected accreditation
        } else {
            setAccreditation((prev) => prev.filter((v) => v !== value)); // Remove unselected accreditation
        }
    };


    // Handle radio button change for email sending type
    const handleEmailSendTypeChange = (e) => {
        setEmailSendType(e.target.value);
        setSingularEmail('');
        setSingularParent('');
        setFilterBy(''); // Reset filters when switching types
        setFilterValues([]);
        setProgram('');
        setAccreditation('');
    };

    // Filter students based on selected filters
    useEffect(() => {
        if (studentsData && (filterValues.length > 0 || program.length > 0 || accreditation.length > 0)) {
            let filtered = filterEnrolledStudents(studentsData, schoolYear);

            // Common status filter for all cases
            const statusFilter = (student) =>
                student.studentStatus === 'INITIALLY_ENROLLED' || student.studentStatus === 'ENROLLED';

            if (filterBy === 'gradeLevels') {
                // Filter by Grade Levels
                filtered = filtered.filter((student) =>
                    filterValues.includes(student.incomingGradeLevel) && statusFilter(student)
                );
            } else if (filterBy === 'gradeGroups') {
                // Filter by Grade Groups
                const selectedGroups = GRADE_LEVEL_GROUPS.filter((g) => filterValues.includes(g.name));
                filtered = filtered.filter((student) =>
                    selectedGroups.some((group) => group.levels.includes(student.incomingGradeLevel)) && statusFilter(student)
                );
            } else if (filterBy === 'gradeForms') {
                // Filter by Grade Forms
                const selectedForms = filterValues.flatMap((form) => GRADE_LEVEL_FORMS[form]);
                filtered = filtered.filter((student) =>
                    selectedForms.includes(student.incomingGradeLevel) && statusFilter(student)
                );
            }

            // Apply Program filter (if multiple are selected)
            if (program.length > 0) {
                filtered = filtered.filter((student) => program.includes(student.program));
            }

            // Apply Accreditation filter (if multiple are selected)
            if (accreditation.length > 0) {
                filtered = filtered.filter((student) => accreditation.includes(student.accreditation));
            }

            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(studentsData?.students || []);
        }
    }, [filterValues, filterBy, program, accreditation, studentsData, schoolYear]);


    // Extract guardian emails after filtering students
    useEffect(() => {
        if (filterValues.length === 0 || filteredStudents.length === 0) {
            setGuardianEmails([]); // Reset guardianEmails if no filters are selected
        } else if (Array.isArray(filteredStudents) && filteredStudents.length > 0) {
            const emailsAndGuardians = filteredStudents
                .map((student) => {
                    const guardianInfo = student.student?.creator;
                    if (guardianInfo) {
                        return {
                            email: guardianInfo?.email,
                            secondaryEmail: student.student?.creator?.guardianInformation?.anotherEmail,
                            primaryGuardianName: guardianInfo?.guardianInformation?.primaryGuardianName,
                        };
                    }
                    return null;
                })
                .filter((info) => info !== null); // Filter out any null results

            // Filter out duplicates based on email
            const uniqueEmailsAndGuardians = Array.from(
                new Set(emailsAndGuardians.map(info => info.email))
            ).map(email => {
                return emailsAndGuardians.find(info => info.email === email);
            });

            setGuardianEmails(uniqueEmailsAndGuardians);
        }
    }, [filteredStudents, filterValues]);

    useEffect(() => {
        // Validate form when any related state changes
        if (emailSendType === 'auto') {
            // Validate fields for multiple emails
            const isAutoValid =
                filterValues.length > 0 && guardianEmails.length > 0 && emailSender && emailSubject && emailContent;
            setIsFormValid(isAutoValid);
        } else if (emailSendType === 'manual') {
            // Validate fields for single email
            const isManualValid =
                guardianEmails.length > 0 && emailSender && emailSubject && emailContent;
            setIsFormValid(isManualValid);
        }
    }, [filterValues, emailSender, emailSubject, emailContent, singularEmail, singularParent, emailSendType, guardianEmails]);


    const handleSenderChange = (event) => {
        setEmailSender(event.target.value);
    };

    // Convert base64 data URI to File object
    const dataURItoFile = (dataURI, filename) => {
        const arr = dataURI.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    // Upload image to Firebase Storage
    const uploadImageToFirebase = async (imageFile) => {
        try {
            // Validate file
            if (!imageFile) {
                throw new Error('No file provided');
            }

            // Generate unique filename using same pattern as enrollment.js
            const extension = imageFile.name?.split('.').pop() || 'png';
            const fileName = `email_template_images/image-${crypto
                .createHash('md5')
                .update(imageFile.name + Date.now())
                .digest('hex')
                .substring(0, 12)}-${format(
                    new Date(),
                    'yyyy.MM.dd.kk.mm.ss'
                )}.${extension}`;

            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, imageFile);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Optional: Track upload progress
                        // Progress tracking can be added here if needed
                    },
                    (error) => {
                        // Use same error handling pattern as enrollment.js
                        const errorMessage = error?.message || error?.code || 'Failed to upload image';
                        toast.error(errorMessage);
                        reject(new Error(errorMessage));
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        } catch (error) {
                            const errorMessage = error?.message || 'Failed to get image URL';
                            toast.error(errorMessage);
                            reject(new Error(errorMessage));
                        }
                    }
                );
            });
        } catch (error) {
            const errorMessage = error?.message || 'Unknown error occurred';
            toast.error(errorMessage);
            throw error;
        }
    };

    // Process images in HTML content - convert base64 to Firebase URLs
    const processImagesInContent = async (htmlContent) => {
        if (!htmlContent) return htmlContent;

        // Find all base64 images in the content
        const base64ImageRegex = /<img[^>]+src="(data:image\/[^;]+;base64,[^"]+)"[^>]*>/gi;
        const matches = [...htmlContent.matchAll(base64ImageRegex)];

        if (matches.length === 0) {
            return htmlContent; // No base64 images found
        }

        let processedContent = htmlContent;

        // Process each base64 image
        for (const match of matches) {
            try {
                const base64Data = match[1];
                // Generate filename using same pattern as enrollment.js
                const filename = `image-${crypto
                    .createHash('md5')
                    .update(base64Data + Date.now())
                    .digest('hex')
                    .substring(0, 12)}-${format(
                        new Date(),
                        'yyyy.MM.dd.kk.mm.ss'
                    )}.png`;
                const imageFile = dataURItoFile(base64Data, filename);

                // Check file size (5MB limit per image)
                if (imageFile.size > 5 * 1024 * 1024) {
                    toast.error(`Image is too large. Maximum size is 5MB.`);
                    continue; // Skip this image
                }

                const firebaseUrl = await uploadImageToFirebase(imageFile);
                // Replace base64 with Firebase URL
                processedContent = processedContent.replace(match[1], firebaseUrl);
            } catch (error) {
                // Use same error handling pattern as enrollment.js
                const errorMessage = error?.message || 'Failed to upload image';
                toast.error(errorMessage);
                // Continue processing other images instead of stopping
            }
        }

        return processedContent;
    };

    const handleSendClick = async () => {
        setIsSending(true); // Disable button while sending emails

        try {
            const guardianEmailsToSend = guardianEmails;

            // Process images in email content first
            toast.loading('Processing images...', { id: 'processing-images' });
            const processedEmailContent = await processImagesInContent(emailContent);
            toast.dismiss('processing-images');

            // Calculate total attachment size
            const totalAttachmentSize = attachments.reduce((total, file) => total + file.size, 0);

            // Check if total attachment size exceeds 15MB
            if (totalAttachmentSize > 15 * 1024 * 1024) {
                toast.error('Total attachment size exceeds 15 MB. Please reduce the size or number of attachments.');
                setIsSending(false);
                return; // Stop the function
            }

            // Validate individual file sizes
            for (const file of attachments) {
                if (file.size > 10 * 1024 * 1024) { // Check if any file exceeds 10MB
                    toast.error('File too large. Size should not exceed 10 MB.');
                    setIsSending(false);
                    return; // Stop the function if a file exceeds the size limit
                }
            }

            // Upload attachments to Firebase Storage and get download URLs
            const uploadPromises = attachments.map((file) => {
                return new Promise((resolve, reject) => {
                    const storageRef = ref(storage, `attachments/${file.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    uploadTask.on(
                        'state_changed',
                        null, // Optional: You can track upload progress here
                        (error) => reject(error), // Handle upload error
                        () => {
                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => resolve(downloadURL));
                        }
                    );
                });
            });

            const attachmentUrls = await Promise.all(uploadPromises); // Wait for all uploads to complete

            // Function to split an array into chunks of a specific size
            const chunkArray = (array, size) => {
                const chunks = [];
                for (let i = 0; i < array.length; i += size) {
                    chunks.push(array.slice(i, i + size));
                }
                return chunks;
            };

            // Function to delay execution for a specified number of milliseconds
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // Chunk the guardian emails into batches of 50
            const batches = chunkArray(guardianEmailsToSend, 50);

            for (const batch of batches) {
                const response = await fetch('/api/broadcast', { // Adjust the API endpoint accordingly
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        emailContent: processedEmailContent, // Use processed content with Firebase URLs
                        sender: emailSender,
                        subject: emailSubject,
                        guardianEmails: batch, // Send the current batch
                        ccEmails, // Add ccEmails to the request payload
                        attachmentUrls, // Include attachment URLs in the JSON payload
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    toast.error(`Failed to send emails: ${errorData.errors?.error?.msg || 'Unknown error'}`);
                    setIsSending(false);
                    return; // Stop if any batch fails
                }

                await delay(2000); // Delay between batches
            }

            toast.success('Emails sent successfully!');

            // Optionally reset state after sending
            setSingularParent('');
            setSingularEmail('');
            setGuardianEmails([]);
            setEmailContent('');
            setEmailSubject('');
            setEmailSender('');
            setFilterValues([]);
            setProgram([]);
            setAccreditation([]);
            setCcEmails([]);
        } catch (error) {
            toast.error('An error occurred while sending emails. Please try again.');
        } finally {
            setIsSending(false); // Re-enable button after sending
        }
    };


    const handleContentChange = (content, delta, source, editor) => {
        // Ensure content is always a string to prevent ReactQuill errors
        setEmailContent(content || ''); // Use Quill content (HTML format)

        // Store the editor instance when we have it (onChange provides editor as 4th param)
        if (editor) {
            quillEditorRef.current = editor;
        }
    };

    // Keep ref updated with latest handleContentChange
    useEffect(() => {
        handleContentChangeRef.current = handleContentChange;
    }, []);


    // Get Quill editor instance after ReactQuill mounts
    useEffect(() => {
        const getEditor = () => {
            if (quillRef.current) {
                // Try different ways to access the editor based on ReactQuill version
                if (quillRef.current.editor) {
                    quillEditorRef.current = quillRef.current.editor;
                } else if (quillRef.current.quill) {
                    quillEditorRef.current = quillRef.current.quill;
                } else if (quillRef.current.getEditor && typeof quillRef.current.getEditor === 'function') {
                    try {
                        quillEditorRef.current = quillRef.current.getEditor();
                    } catch (e) {
                        // getEditor not available, continue without it
                    }
                }
            }
        };

        // Try immediately
        getEditor();

        // Also try after a short delay in case ReactQuill needs time to initialize
        const timeout = setTimeout(getEditor, 100);

        return () => clearTimeout(timeout);
    }, [emailContent]); // Re-run when content changes to ensure editor is available

    // ReactQuill modules configuration - memoized to prevent ReactQuill state issues
    // Note: We can't use quillRef directly in useMemo, so we'll access it in the handler
    const quillModules = useMemo(() => ({
        imageResize: {
            // Configuration for quill-image-resize module
            modules: ['Resize', 'DisplaySize', 'Toolbar']
        },
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // Headers (also affect size)
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }], // Text color and background color
                [{ 'align': [] }], // Text alignment
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }], // Indentation
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean'] // Remove formatting
            ],
            handlers: {
                image: function () {
                    // In ReactQuill handlers, 'this' is the Toolbar object, not the Quill editor
                    // The Toolbar has a 'quill' property that contains the actual editor
                    let quillEditor = this.quill;

                    // Fallback to stored ref if available
                    if (!quillEditor || typeof quillEditor.getSelection !== 'function') {
                        quillEditor = quillEditorRef.current;
                    }

                    // Final fallback - try accessing through ReactQuill component
                    if (!quillEditor || typeof quillEditor.getSelection !== 'function') {
                        if (quillRef.current) {
                            quillEditor = quillRef.current.editor ||
                                quillRef.current.quill ||
                                (quillRef.current.getEditor && typeof quillRef.current.getEditor === 'function' ? quillRef.current.getEditor() : null);
                        }
                    }

                    if (!quillEditor || typeof quillEditor.getSelection !== 'function') {
                        toast.error('Editor not ready. Please try again.');
                        return;
                    }

                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();

                    input.onchange = async () => {
                        const file = input.files[0];
                        if (!file) return;

                        // Check file size (5MB limit)
                        if (file.size > 5 * 1024 * 1024) {
                            toast.error('Image is too large. Maximum size is 5MB.');
                            return;
                        }

                        // Validate file type
                        if (!file.type.startsWith('image/')) {
                            toast.error('Please select a valid image file.');
                            return;
                        }

                        setIsUploadingImage(true);
                        try {
                            const firebaseUrl = await uploadImageToFirebase(file);

                            // Get current selection
                            let range = quillEditor.getSelection(true);

                            // If no selection, place at end
                            if (!range || range.index === null) {
                                const length = quillEditor.getLength();
                                range = { index: length > 1 ? length - 1 : 0, length: 0 };
                            }

                            const insertIndex = range.index;

                            // Insert the image
                            quillEditor.insertEmbed(insertIndex, 'image', firebaseUrl);

                            // Move cursor after image
                            quillEditor.setSelection(insertIndex + 1);

                            // Manually trigger onChange since programmatic inserts don't always trigger it
                            // Use requestAnimationFrame to ensure DOM is updated
                            requestAnimationFrame(() => {
                                const updatedContent = quillEditor.root.innerHTML;
                                // Update state directly
                                setEmailContent(updatedContent);
                            });

                            toast.success('Image uploaded successfully!');
                        } catch (error) {
                            toast.error('Failed to insert image. Please try again.');
                        } finally {
                            setIsUploadingImage(false);
                        }
                    };
                }
            }
        }
    }), []); // Empty dependency array - modules don't change

    // Generate preview content
    const generatePreviewContent = async () => {
        setIsProcessingPreview(true);
        try {
            // Process images in content (use empty string if no content)
            const processedContent = emailContent ? await processImagesInContent(emailContent) : '';

            // Get sender details (use default if not selected)
            const senderDetails = emailSender ? getSenderDetails(emailSender) : { senderRole: 'Administrator', senderFullName: 'Living Pupil Homeschool Team' };
            const { senderRole, senderFullName } = senderDetails;

            // Generate full email HTML using template
            const previewHTML = announcementHtml({
                parentName: guardianEmails.length > 0
                    ? guardianEmails[0].primaryGuardianName?.split(' ')[0] || 'Sample Parent'
                    : 'Sample Parent',
                emailContent: processedContent,
                senderRole,
                senderFullName
            });

            setPreviewContent(previewHTML);
            setTestEmailSubject(emailSubject || 'Test Email Subject'); // Pre-fill test email subject with current subject or default
            setTestEmailSender(emailSender || ''); // Pre-fill test email sender with current sender
            setShowPreview(true);
        } catch (error) {
            toast.error('Failed to generate preview. Please try again.');
        } finally {
            setIsProcessingPreview(false);
        }
    };

    // Send test email
    const sendTestEmail = async () => {
        if (!testEmail || !testEmailSubject) {
            toast.error('Please enter both test email address and subject.');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(testEmail)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        // Check if content and sender are filled (with better validation)
        // ReactQuill might return HTML like <p><br></p> or <p></p> for empty content
        // We'll check if there's actual text content (not just HTML tags)
        const textContent = emailContent
            ? emailContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
            : '';
        const hasContent = textContent.length > 0;
        const hasTestSender = testEmailSender && testEmailSender.trim().length > 0;

        if (!hasContent) {
            toast.error('Please add content to the email before sending a test email.');
            return;
        }

        if (!hasTestSender) {
            toast.error('Please select a test email sender before sending a test email.');
            return;
        }

        setIsSendingTestEmail(true);
        try {
            // Process images in content
            const processedContent = await processImagesInContent(emailContent);

            // Upload attachments to Firebase Storage and get download URLs (same as in handleSendClick)
            const uploadPromises = attachments.map((file) => {
                return new Promise((resolve, reject) => {
                    const storageRef = ref(storage, `attachments/${file.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    uploadTask.on(
                        'state_changed',
                        null,
                        (error) => reject(error),
                        () => {
                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => resolve(downloadURL));
                        }
                    );
                });
            });

            const attachmentUrls = await Promise.all(uploadPromises);

            // Prepare test email data - use testEmailSender instead of emailSender
            const testEmailData = {
                emailContent: processedContent,
                sender: testEmailSender, // Use test email sender instead of regular sender
                subject: testEmailSubject,
                guardianEmails: [{ email: testEmail, primaryGuardianName: 'Test Recipient' }],
                ccEmails: [],
                attachmentUrls: attachmentUrls
            };

            const response = await fetch('/api/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testEmailData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(`Test email sent successfully to ${testEmail}!`);
                setTestEmail(''); // Clear test email field
            } else {
                toast.error(result.error?.msg || 'Failed to send test email. Please try again.');
            }
        } catch (error) {
            toast.error('Failed to send test email. Please try again.');
        } finally {
            setIsSendingTestEmail(false);
        }
    };

    const filterValueOptions =
        filterBy === 'gradeLevels'
            ? Object.entries(GRADE_LEVEL).map(([value, label]) => ({ value, label }))
            : filterBy === 'gradeGroups'
                ? GRADE_LEVEL_GROUPS.map((group) => ({ value: group.name, label: group.name }))
                : Object.entries(GRADE_LEVEL_FORMS).map(([form, levels]) => ({ value: form, label: form }));

    if (isLoading) {
        return <div>Loading...</div>; // Loading state when data is being fetched
    }

    const handleFilterByChange = (key) => {
        setFilterBy(key);
        setFilterValues([]); // Reset filterValues when the filter option changes
        setGuardianEmails([]);
    };

    return (
        <AdminLayout>
            <Meta title="Living Pupil Homeschool - Broadcast Email" />
            <Content.Title title="Broadcast Email" subtitle="Send email to parents" />
            <Card>
                <Card.Body title="Compose Email">
                    {/* Radio Buttons for Single/Multiple Email */}
                    <div className="mb-4">
                        <label className="text-lg font-bold mr-5">Send To:</label>
                        <div className="flex space-x-4">
                            <label>
                                <input
                                    type="radio"
                                    value="auto"
                                    checked={emailSendType === 'auto'}
                                    onChange={handleEmailSendTypeChange}
                                />
                                <span className="ml-2">Auto</span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="manual"
                                    checked={emailSendType === 'manual'}
                                    onChange={handleEmailSendTypeChange}
                                />
                                <span className="ml-2">Manual</span>
                            </label>
                        </div>
                    </div>

                    {/* Show either filters or single email input based on the selection */}
                    {emailSendType === 'auto' && (
                        <div>
                            <div className="mb-4 lg:w-1/4">
                                <label className="text-lg font-bold mr-5">School Year</label>
                                <div
                                    className={`relative inline-block w-full ${schoolYear.length <= 0 ? 'border-red-500 border-2 rounded' : 'border-none'}`}
                                >
                                    <select
                                        className="w-full px-3 py-2 appearance-none rounded border"
                                        onChange={handleSchoolYearChange}
                                        value={schoolYear}
                                    >
                                        <option value="">Select School Year</option>
                                        <option value="2024-2025">2024-2025</option>
                                        <option value="2025-2026">2025-2026</option>

                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <ChevronDownIcon className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            {/* Filter and Sender Section */}
                            <div className="flex flex-col">
                                <div className="flex flex-col w-full md:w-1/2 space-y-2">
                                    <div className="text-lg font-bold">Filter By:</div>
                                    <div className="flex flex-wrap space-x-4">
                                        {Object.entries(filterOptions).map(([key, label]) => (
                                            <button
                                                key={key}
                                                onClick={() => handleFilterByChange(key)} // Use handleFilterByChange to reset filterValues
                                                className={`p-2 border rounded ${filterBy === key ? 'bg-blue-500 text-white' : 'bg-white'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Display checkboxes for the selected filter */}
                                {filterBy && (
                                    <div className="mt-2">
                                        {filterValueOptions.map(({ value, label }) => (
                                            <label key={value} className="block">
                                                <input
                                                    type="checkbox"
                                                    value={value}
                                                    onChange={e => handleCheckboxChange(e, setFilterValues)}
                                                />
                                                <span className="ml-2">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Program Checkbox */}
                            <div className="mt-2">
                                {/* Display checkboxes for program selection */}
                                <div className="text-lg font-bold">Program:</div>
                                {Object.entries(PROGRAM).map(([value, label]) => (
                                    <label key={value} className="block">
                                        <input
                                            type="checkbox"
                                            value={value}
                                            onChange={(e) => handleCheckboxChange(e, setProgram)} // Use checkbox change handler
                                        />
                                        <span className="ml-2">{label}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Accreditation Checkbox */}
                            <div className="mt-2">
                                {/* Display checkboxes for accreditation selection */}
                                <div className="text-lg font-bold">Accreditation:</div>
                                {Object.entries(ACCREDITATION_NEW).map(([value, label]) => (
                                    <label key={value} className="block">
                                        <input
                                            type="checkbox"
                                            value={value}
                                            onChange={(e) => handleCheckboxChange(e, setAccreditation)} // Use checkbox change handler
                                        />
                                        <span className="ml-2">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {emailSendType === 'manual' && (
                        <>
                            <div className="mt-4 flex flex-col">
                                {/* Manually adding email and parent name */}
                                <label className="text-lg font-bold">Parent's Email:</label>
                                <input
                                    type="email"
                                    value={singularEmail}
                                    onChange={(e) => setSingularEmail(e.target.value)}
                                    className={` p-2 border rounded w-full md:w-1/2 ${guardianEmails.length <= 0 ? 'border-red-500 border-2 rounded' : 'border'}`}
                                    placeholder="Enter parent's email"
                                />
                            </div>
                            <div className="mt-4 flex flex-col">
                                <label className="text-lg font-bold">Parent's Name:</label>
                                <input
                                    type="text"
                                    value={singularParent}
                                    onChange={(e) => setSingularParent(e.target.value)}
                                    className={` p-2 border rounded w-full md:w-1/2 ${guardianEmails.length <= 0 ? 'border-red-500 border-2 rounded' : 'border'}`}
                                    placeholder="Enter parent's name"
                                />
                            </div>
                            <div className="mt-4 flex justify-left">
                                {/* Add to Guardian Emails Button */}
                                <button
                                    onClick={() => {
                                        if (singularEmail && singularParent) {
                                            setGuardianEmails((prev) => [
                                                ...prev,
                                                { email: singularEmail, primaryGuardianName: singularParent },
                                            ]);
                                            setSingularEmail('');
                                            setSingularParent('');
                                        }
                                    }}
                                    className="bg-primary-500 text-white px-4 py-2 rounded mt-2"
                                >
                                    Add Parent
                                </button>
                            </div>

                            {/* Display the added parents */}
                            <div className="mt-4">
                                <h3 className="font-bold">Added Parents:</h3>
                                {guardianEmails.map((guardian, index) => (
                                    <div key={index} className="flex justify-between">
                                        <span>{guardian.primaryGuardianName} - {guardian.email}</span>
                                        <button
                                            onClick={() => {
                                                setGuardianEmails(guardianEmails.filter((_, i) => i !== index));
                                            }}
                                            className="text-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="mt-4 flex flex-col">
                        <label className="text-lg font-bold">CC Emails:</label>
                        <div className="flex space-x-2">
                            <input
                                type="email"
                                value={ccInput}
                                onChange={(e) => setCcInput(e.target.value)}
                                className="p-2 border rounded w-full md:w-1/2"
                                placeholder="Enter CC email"
                            />
                            <button
                                onClick={() => {
                                    if (ccInput) {
                                        setCcEmails((prev) => [...prev, ccInput]);
                                        setCcInput(''); // Clear input after adding
                                    }
                                }}
                                className="bg-primary-500 text-white px-4 py-2 rounded"
                            >
                                Add CC
                            </button>
                        </div>
                    </div>

                    {/* Display the added CC emails */}
                    <div className="mt-4">
                        <h3 className="font-bold">CC Emails:</h3>
                        {ccEmails.map((email, index) => (
                            <div key={index} className="flex justify-between mt-2 mb-2">
                                <span>{email}</span>
                                <button
                                    onClick={() => {
                                        setCcEmails(ccEmails.filter((_, i) => i !== index));
                                    }}
                                    className="text-red-500"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Email Sender Dropdown */}
                    <div className="flex flex-col w-full md:w-1/2 space-y-2 mt-5">
                        <div className="text-lg font-bold">Sender:</div>
                        <div
                            className={`relative inline-block w-full ${emailSender.length <= 0 ? 'border-red-500 border-2 rounded' : 'border-none'}`}
                        >
                            <select
                                className="w-full px-3 py-2 appearance-none rounded border"
                                onChange={handleSenderChange}
                                value={emailSender}
                            >
                                <option value="">Select Sender</option>
                                {emailSenderOptions.map(({ value, label }) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <ChevronDownIcon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Subject Section */}
                    <div className="flex flex-col">
                        <label className="text-lg font-bold mr-5" htmlFor="txtMother">
                            Subject:
                        </label>
                        <input
                            className={`px-3 py-2 rounded md:w-1/2 ${emailSubject.length <= 0 ? 'border-red-500 border-2' : 'border'
                                }`}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            value={emailSubject}
                        />
                    </div>

                    <div className="flex flex-col mt-4">
                        <label className="text-lg font-bold">Attach Files:</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            multiple
                            className="p-2 border rounded w-full md:w-1/2"
                        />
                    </div>

                    <div className="mt-4" style={{ minHeight: '260px', height: 'auto' }}>
                        <label className="text-lg font-bold mr-5" htmlFor="txtMother">
                            Content:
                        </label>
                        {isUploadingImage && (
                            <div className="mb-2 text-sm text-blue-600">
                                Uploading image...
                            </div>
                        )}
                        {ReactQuill && (
                            <ReactQuill
                                ref={(el) => {
                                    quillRef.current = el;
                                    // Try to get editor immediately when ref is set
                                    if (el) {
                                        // ReactQuill v2.0.0+ should have getEditor method
                                        if (typeof el.getEditor === 'function') {
                                            try {
                                                quillEditorRef.current = el.getEditor();
                                            } catch (e) {
                                                // getEditor failed, continue without it
                                            }
                                        }
                                        // Also try accessing internal properties
                                        if (!quillEditorRef.current && el.editor) {
                                            quillEditorRef.current = el.editor;
                                        }
                                        if (!quillEditorRef.current && el.quill) {
                                            quillEditorRef.current = el.quill;
                                        }
                                    }
                                }}
                                value={emailContent || ''}
                                onChange={handleContentChange}
                                modules={quillModules}
                                style={{ height: '90%', resize: 'vertical' }}
                                onFocus={() => {
                                    // Try to capture editor on focus
                                    if (quillRef.current && !quillEditorRef.current) {
                                        if (typeof quillRef.current.getEditor === 'function') {
                                            try {
                                                quillEditorRef.current = quillRef.current.getEditor();
                                            } catch (e) {
                                                // Ignore
                                            }
                                        }
                                    }
                                }}
                            />
                        )}
                    </div>

                    {/* Preview and Send Email Buttons */}
                    <div className="flex justify-center gap-4 mt-4"> {/* Added mt-4 for margin-top */}
                        <button
                            onClick={generatePreviewContent}
                            disabled={isProcessingPreview}
                            className={`w-1/4 mt-10 py-3 px-4 rounded-md text-white font-bold ${isProcessingPreview ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                            {isProcessingPreview ? 'Processing...' : 'Preview Email'}
                        </button>
                        <button
                            onClick={handleSendClick}
                            disabled={!isFormValid || isSending}
                            className={`w-1/4 mt-10 py-3 px-4 rounded-md text-white font-bold ${isSending || !isFormValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                        >
                            {isSending ? 'Sending...' : 'Send Email'}
                        </button>
                    </div>

                </Card.Body>
            </Card>

            {/* Email Preview Modal */}
            <Modal
                show={showPreview}
                title="Email Preview"
                toggle={() => setShowPreview(false)}
            >
                <div className="w-full max-w-4xl">
                    <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
                        <p className="font-semibold">Preview Information:</p>
                        <p>Subject: {emailSubject}</p>
                        <p>From: {emailSender ? emailSenderOptions.find(opt => opt.value === emailSender)?.label : 'Not selected'}</p>
                        <p>Recipients: {guardianEmails.length} {guardianEmails.length === 1 ? 'parent' : 'parents'}</p>
                        <p className="mt-2 text-xs text-gray-600 italic">
                            Note: This is a preview. Actual email may vary slightly in different email clients.
                        </p>
                    </div>

                    {/* Send Test Email Section */}
                    <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-semibold text-lg mb-3">Send Test Email</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Test Email Address:</label>
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    placeholder="Enter email address to send test email"
                                    className="w-full p-2 border rounded"
                                    disabled={isSendingTestEmail}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Test Email Subject:</label>
                                <input
                                    type="text"
                                    value={testEmailSubject}
                                    onChange={(e) => setTestEmailSubject(e.target.value)}
                                    placeholder="Enter test email subject"
                                    className="w-full p-2 border rounded"
                                    disabled={isSendingTestEmail}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Test Email Sender:</label>
                                <select
                                    value={testEmailSender}
                                    onChange={(e) => setTestEmailSender(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    disabled={isSendingTestEmail}
                                >
                                    <option value="">Select Test Sender</option>
                                    {emailSenderOptions.map(({ value, label }) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={sendTestEmail}
                                disabled={isSendingTestEmail || !testEmail || !testEmailSubject || !testEmailSender}
                                className={`px-4 py-2 rounded text-white font-medium ${isSendingTestEmail || !testEmail || !testEmailSubject || !testEmailSender
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                            >
                                {isSendingTestEmail ? 'Sending...' : 'Send Test Email'}
                            </button>
                        </div>
                    </div>

                    <div
                        className="border rounded p-4 bg-white"
                        style={{
                            maxWidth: '600px',
                            margin: '0 auto',
                            fontFamily: 'Arial, Helvetica, sans-serif'
                        }}
                        dangerouslySetInnerHTML={{ __html: previewContent }}
                    />
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default Broadcast;
