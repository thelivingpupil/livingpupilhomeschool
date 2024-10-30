import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; // Use dynamic import for ReactQuill to avoid SSR issues
import Meta from '@/components/Meta';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import { GRADE_LEVEL, GRADE_LEVEL_GROUPS, GRADE_LEVEL_FORMS, ACCREDITATION_NEW, PROGRAM } from '@/utils/constants';
import { useStudents } from '@/hooks/data';
import { ChevronDownIcon } from '@heroicons/react/outline';

// Dynamically import ReactQuill to avoid SSR (Server-Side Rendering) issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
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
    const [emailSendType, setEmailSendType] = useState('multiple'); // State to determine single or multiple emails
    const [singularEmail, setSingularEmail] = useState(''); // State for singular email input
    const [singularParent, setSingularParent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false); // Track form validity

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
            let filtered = studentsData.students;

            // Log the initial list of students
            //console.log('Initial students list:', filtered);

            // Common status filter for all cases
            const statusFilter = (student) =>
                student.studentStatus === 'INITIALLY_ENROLLED' || student.studentStatus === 'ENROLLED' || student.studentStatus === 'PENDING';

            if (filterBy === 'gradeLevels') {
                // Filter by Grade Levels
                filtered = filtered.filter((student) =>
                    filterValues.includes(student.incomingGradeLevel) && statusFilter(student)
                );
                //console.log('Filtered by grade levels:', filtered);
            } else if (filterBy === 'gradeGroups') {
                // Filter by Grade Groups
                const selectedGroups = GRADE_LEVEL_GROUPS.filter((g) => filterValues.includes(g.name));
                filtered = filtered.filter((student) =>
                    selectedGroups.some((group) => group.levels.includes(student.incomingGradeLevel)) && statusFilter(student)
                );
                //console.log('Filtered by grade groups:', filtered);
            } else if (filterBy === 'gradeForms') {
                // Filter by Grade Forms
                const selectedForms = filterValues.flatMap((form) => GRADE_LEVEL_FORMS[form]);
                filtered = filtered.filter((student) =>
                    selectedForms.includes(student.incomingGradeLevel) && statusFilter(student)
                );
                //console.log('Filtered by grade forms:', filtered);
            }

            // Apply Program filter (if multiple are selected)
            if (program.length > 0) {
                //console.log('Program selected:', program);
                filtered = filtered.filter((student) => program.includes(student.program));
                //console.log('Filtered by program:', filtered);
            }

            // Apply Accreditation filter (if multiple are selected)
            if (accreditation.length > 0) {
                //console.log('Accreditation selected:', accreditation);
                filtered = filtered.filter((student) => accreditation.includes(student.accreditation));
                //console.log('Filtered by accreditation:', filtered);
            }

            // Log final filtered students
            //console.log('Final filtered students:', filtered);
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(studentsData?.students || []);
            //console.log('No filters applied, showing all students.');
        }
    }, [filterValues, filterBy, program, accreditation, studentsData]);


    // Extract guardian emails after filtering students
    useEffect(() => {
        if (filterValues.length === 0 || filteredStudents.length === 0) {
            setGuardianEmails([]); // Reset guardianEmails if no filters are selected
        } else if (Array.isArray(filteredStudents) && filteredStudents.length > 0) {
            const emailsAndGuardians = filteredStudents
                .map((student) => {
                    const guardianInfo = student.student?.creator?.guardianInformation;
                    if (guardianInfo) {
                        return {
                            email: guardianInfo.anotherEmail,
                            primaryGuardianName: guardianInfo.primaryGuardianName,
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
        if (emailSendType === 'multiple') {
            // Validate fields for multiple emails
            const isMultipleValid =
                filterValues.length > 0 && guardianEmails.length > 0 && emailSender && emailSubject && emailContent;
            setIsFormValid(isMultipleValid);
        } else if (emailSendType === 'single') {
            // Validate fields for single email
            const isSingleValid =
                singularEmail && singularParent && emailSender && emailSubject && emailContent;
            setIsFormValid(isSingleValid);
        }
    }, [filterValues, emailSender, emailSubject, emailContent, singularEmail, singularParent, emailSendType, guardianEmails]);


    const handleSenderChange = (event) => {
        setEmailSender(event.target.value);
    };

    const handleSendClick = async () => {
        setIsSending(true); // Disable button while sending emails
        try {
            const guardianEmailsToSend = emailSendType === 'single'
                ? [{ email: singularEmail, primaryGuardianName: singularParent }]
                : guardianEmails; // Handle singular email

            // Function to split an array into chunks of a specific size
            const chunkArray = (array, size) => {
                const chunks = [];
                for (let i = 0; i < array.length; i += size) {
                    chunks.push(array.slice(i, i + size));
                }
                return chunks;
            };

            // Function to delay execution for a specified number of milliseconds (1 minute = 60000 ms)
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // Chunk the guardian emails into batches of 50
            const batches = chunkArray(guardianEmailsToSend, 10);

            for (const batch of batches) {
                const response = await fetch('/api/broadcast', { // Adjust the API endpoint accordingly
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        emailContent,
                        sender: emailSender,
                        subject: emailSubject,
                        guardianEmails: batch, // Send the current batch
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    alert(`Failed to send emails: ${errorData.errors.error.msg}`);
                    return; // Stop if any batch fails
                }

                // Wait for 1 minute (60000 ms) before processing the next batch
                await delay(180000);
            }

            alert('Emails sent successfully!');

            // Optionally reset state after sending
            setSingularParent('');
            setSingularEmail('');
            setGuardianEmails([]);
            setEmailContent('');
            setEmailSubject('');
            setEmailSender('');
            setFilterValues([]); // Reset filterValues
            setProgram([]); // Reset program checkboxes
            setAccreditation([]); // Reset accreditation checkboxes

        } catch (error) {
            console.error('Error sending emails:', error);
            alert('An error occurred while sending emails. Please try again.');
        } finally {
            setIsSending(false); // Re-enable button after sending
        }
    };


    const handleContentChange = (content) => {
        setEmailContent(content); // Use Quill content (HTML format)
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
                                    value="multiple"
                                    checked={emailSendType === 'multiple'}
                                    onChange={handleEmailSendTypeChange}
                                />
                                <span className="ml-2">Multiple Emails</span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="single"
                                    checked={emailSendType === 'single'}
                                    onChange={handleEmailSendTypeChange}
                                />
                                <span className="ml-2">Single Email</span>
                            </label>
                        </div>
                    </div>

                    {/* Show either filters or single email input based on the selection */}
                    {emailSendType === 'multiple' ? (
                        <div>
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
                    ) : (
                        <>
                            <div className="mt-4 flex flex-col">
                                {/* Input field for single email */}
                                <label className="text-lg font-bold">Parent's Email:</label>
                                <input
                                    type="email"
                                    value={singularEmail}
                                    onChange={(e) => setSingularEmail(e.target.value)}
                                    className={` p-2 border rounded w-full md:w-1/2 ${singularEmail.length <= 0 ? 'border-red-500 border-2 rounded' : 'border'}`}
                                    placeholder="Enter parent's email"
                                />
                            </div>
                            <div className="mt-4 flex flex-col">
                                {/* Input field for single email */}
                                <label className="text-lg font-bold">Parent's Name:</label>
                                <input
                                    type="email"
                                    value={singularParent}
                                    onChange={(e) => setSingularParent(e.target.value)}
                                    className={` p-2 border rounded w-full md:w-1/2 ${singularParent.length <= 0 ? 'border-red-500 border-2 rounded' : 'border'}`}
                                    placeholder="Enter parent's name"
                                />
                            </div>
                        </>
                    )}

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

                    <div className="mt-4" style={{ minHeight: '260px', height: 'auto' }}>
                        <label className="text-lg font-bold mr-5" htmlFor="txtMother">
                            Content:
                        </label>
                        <ReactQuill
                            value={emailContent}
                            onChange={handleContentChange}
                            style={{ height: '90%', resize: 'vertical' }} // Ensure the editor fills the parent div
                        />
                    </div>

                    {/* Send Email Button */}
                    <div className="flex justify-center mt-4"> {/* Added mt-4 for margin-top */}
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
        </AdminLayout>
    );
};

export default Broadcast;
