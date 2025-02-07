import React from 'react';
import { useState, useEffect } from 'react';
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, useGridApiRef, DEFAULT_GRID_AUTOSIZE_OPTIONS } from '@mui/x-data-grid';
import {
    BadgeCheckIcon,
    LightningBoltIcon,
    UserIcon,
} from '@heroicons/react/solid';
import { UserType } from '@prisma/client';
import formatDistance from 'date-fns/formatDistance';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@mui/material';
import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import { useDocuments } from '@/hooks/data';
import toast from 'react-hot-toast';
import { DOCUMENT_DETAILS, STATUS_BG_COLOR, PURPOSE_OPTIONS, DOC_STATUS, DOC_STATUS_BG_COLOR } from '@/utils/constants';
import { STATUS_CODES } from '@/lib/server/dragonpay';
import { TransactionStatus } from '@prisma/client';
import { ChevronDownIcon } from '@heroicons/react/outline';
import api from '@/lib/common/api';
import { format } from 'date-fns';

const DocumentRequest = () => {
    const { data, isLoading } = useDocuments();
    const [showModal, setModalVisibility] = useState(false);
    const [isSubmitting, setSubmittingState] = useState(false);
    const [docStatus, setDocStatus] = useState("");
    const [showUpdateRequestStatusModal, setUpdateRequestStatusModalVisibility] = useState(false);
    const apiRef = useGridApiRef();
    const [document, setDocument] = useState(null);
    const [trackingCode, setTrackingCode] = useState("")
    const [region, setRegion] = useState("")


    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
            </GridToolbarContainer>
        );
    }


    const view = (student) => {
        toggleModal();
        setDocument(student);

    };

    const handleTrackingCodeChange = (e) => {
        setTrackingCode(e.target.value);
    };

    const handleDropdownChange = (event) => {
        setRegion(event.target.value);
    };

    const toggleModal = () => setModalVisibility(!showModal);
    const toggleUpdateRequestStatusModal = () => setUpdateRequestStatusModalVisibility(!showUpdateRequestStatusModal)

    const viewUpdateDocumentRequestStatus = (document) => {
        toggleUpdateRequestStatusModal();
        setDocument(document);
    }

    const updateDocumentRequestStatus = () => {
        setSubmittingState(true);
        api('/api/documentRequest/getDocs', {
            body: {
                requestCode: document.requestCode,
                status: docStatus,
                email: document.requestorInformation.requestorEmail,
                requestorFullName: document.requestorInformation.requestorFullName,
                studentFullName: document.studentInformation.studentFullName,
                document: document.documents,
                documentCollection: document.documentCollection,
                trackingCode: trackingCode,
                region: region
            },
            method: 'PATCH',
        })
            .then(response => {
                setSubmittingState(false);
                if (response.errors) {
                    Object.keys(response.errors).forEach((error) =>
                        toast.error(response.errors[error].msg)
                    );
                } else {
                    toast.success('Update document request status success');
                    toggleUpdateRequestStatusModal();
                    toggleModal();
                }
            })
            .catch(error => {
                setSubmittingState(false);
                toast.error(`Error updating document request status: ${error.message}`);
            });
    };

    return (
        <AdminLayout>
            <Meta title="Living Pupil Homeschool - Users" />
            {document && (
                <SideModal
                    title={`LP - ${document.requestCode}`}
                    show={showModal}
                    toggle={toggleModal}
                >
                    <div className="mt-1">
                        <p>
                            <strong>Request Date:</strong>{" "}
                            {format(new Date(document.createdAt), 'MMMM d, yyyy')}
                        </p>
                    </div>
                    <div className="mt-1">
                        <p>
                            <strong>Purpose:</strong>{" "}
                            {PURPOSE_OPTIONS.find((option) => option.value === document.purpose)?.label || "Not Selected"}
                        </p>
                    </div>

                    <div className="mt-6">
                        <p className="font-bold text-blue-600 text-sm">Documents:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                            {document.documents.map((doc) => (
                                <li key={doc.id}>
                                    {DOCUMENT_DETAILS[doc.docName]?.label}
                                    <div className="ml-5">
                                        {doc.url
                                            .split(", ")
                                            .map((url, index) => (
                                                <a
                                                    key={index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 underline block"
                                                >
                                                    View Document {index + 1}
                                                </a>
                                            ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="font-bold text-blue-600 text-sm">Student Information</p>
                        <div className="px-3 text-sm">
                            <p><strong>Student Full Name:</strong> {document?.studentInformation.studentFullName}</p>
                            <p><strong>LRN:</strong> {document?.studentInformation.lrn}</p>
                            <p><strong>Grade Level:</strong> {document?.studentInformation.currentGradeLevel}</p>
                            <p><strong>Current School:</strong> {document?.studentInformation.currentSchool}</p>
                            <p><strong>Grades With LP:</strong> {document?.studentInformation.gradeLevelsWithLp}</p>
                            <p><strong>Last School Year:</strong> {document?.studentInformation.lastSchoolYearWithLp}</p>
                        </div>
                    </div>

                    <div>
                        <p className="font-bold text-blue-600 text-sm">Requestor/Guardian Information</p>
                        <div className="px-3 text-sm">
                            <p><strong>Requestor Full Name:</strong> {document?.requestorInformation.requestorFullName}</p>
                            <p><strong>Relationship:</strong> {document?.requestorInformation.relationshipToStudent}</p>
                            <p><strong>Email:</strong> {document?.requestorInformation.requestorEmail}</p>
                            <p><strong>Occupation:</strong> {document?.requestorInformation.occupation}</p>
                            <p><strong>Guardian Address:</strong> {document?.requestorInformation.requestorAddress}</p>
                            <p><strong>Guardian Mobile:</strong> {document?.requestorInformation.requestorMobileNumber}</p>
                        </div>
                    </div>

                    <div>
                        <p className="font-bold text-blue-600 text-sm">Document Collection</p>
                        <div className="px-3 text-sm">
                            <p>
                                <strong>Document Collection:</strong>{' '}
                                {document?.documentCollection?.charAt(0).toUpperCase() + document?.documentCollection?.slice(1).toLowerCase()}
                            </p>
                            <p><strong>Delivery Address:</strong> {document?.deliveryAddress === "" ? "N/A" : document?.deliveryAddress}</p>
                        </div>
                    </div>


                    <div class="mt-6 flex items-center justify-between">
                        <div className="flex items-center space-x-5">
                            {document?.transaction.paymentReference ? (
                                <h4 className="text-sm font-bold text-gray-400">
                                    Payment Reference:{' '}
                                    <span className="font-mono font-bold uppercase">
                                        {document?.transaction?.paymentReference}
                                    </span>
                                </h4>
                            ) : (
                                <h4 className="text-sm font-bold text-gray-400">
                                    Payment Reference:{' '}
                                    <span className="font-mono font-bold uppercase">
                                        {document?.transaction.paymentReference}
                                    </span>
                                </h4>
                            )}
                            <div className='flex items-center space-x-5'>
                                <h6>
                                    {new Intl.NumberFormat('en-PH', {
                                        style: 'currency',
                                        currency: 'PHP',
                                    }).format(document?.transaction?.amount || 0)}
                                </h6>
                            </div>
                            {document && document?.transaction && (
                                <span
                                    className={`rounded-full py-0.5 text-sm px-2 ${STATUS_BG_COLOR[document?.transaction.paymentStatus]
                                        }`}
                                >
                                    {STATUS_CODES[document?.transaction.paymentStatus]}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col p-3 space-y-2">
                        <button
                            className="px-3 py-1 my-1 text-white rounded bg-primary-600 hover:bg-primary-400"
                            onClick={() => {
                                viewUpdateDocumentRequestStatus(document);
                            }}
                        >
                            Update Document Request Status
                        </button>
                    </div>
                </SideModal>
            )}
            {document && (
                <SideModal
                    title={'Update Request Status'}
                    show={showUpdateRequestStatusModal}
                    toggle={toggleUpdateRequestStatusModal}
                >
                    <div className="flex flex-col space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
                        <div className="flex flex-col w-full">
                            <h4 className="font-bold text-gray-600">Current Status: {DOC_STATUS[document.status]}</h4>
                            <label className="text-lg font-bold" htmlFor="txtMother">
                                Document Request Status <span className="ml-1 text-red-600">*</span>
                            </label>
                            <div className="relative inline-block w-full border rounded">
                                <select
                                    className="w-full px-3 py-2 capitalize rounded appearance-none"
                                    onChange={(e) => setDocStatus(e.target.value)}
                                    value={docStatus}
                                >
                                    <option value="">Select status</option>
                                    {Object.keys(DOC_STATUS).map((entry, index) => (
                                        <option key={index} value={entry}>
                                            {DOC_STATUS[entry]}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <ChevronDownIcon className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {docStatus === 'For_Delivery' && (
                        <>
                            <div className="flex flex-col space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
                                <div className={`flex flex-col w-full`}>
                                    <label className="text-sm font-medium mb-2" htmlFor="txtMother">
                                        Delivery Region <span className="ml-1 text-red-600">*</span>
                                    </label>
                                    <div className={`relative inline-block w-full rounded ${region === "" ? 'border-red-500 border-2' : 'border'}`}>
                                        <select
                                            className="w-full px-3 py-2 capitalize rounded appearance-none"
                                            value={region}
                                            onChange={handleDropdownChange}
                                        >
                                            <option value="">--Select Delivery Region--</option>
                                            <option value="within-cebu">Within Cebu</option>
                                            <option value="outside-cebu">Outside Cebu</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <ChevronDownIcon className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {region === 'outside-cebu' && (
                                <div className="mt-4 mb-4">
                                    <label
                                        htmlFor="deliveryAddress"
                                        className={`block text-sm font-medium`}
                                    >
                                        LBC Tracking Code
                                    </label>
                                    <input
                                        type="text"
                                        id="trackingCodeLBC"
                                        value={trackingCode}
                                        onChange={handleTrackingCodeChange}
                                        className={`mt-2 w-full p-2 border border-gray-300 rounded-md ${trackingCode === "" ? 'border-red-500 border-2' : 'border'}`}
                                    />
                                </div>
                            )}
                        </>

                    )}

                    <div className="flex flex-col p-3 space-y-2">
                        <button
                            className="px-3 py-1 my-1 text-white rounded bg-green-600 hover:bg-green-400"
                            onClick={() => {
                                //editStudentRecord(studentId);
                                toast('Updating Student Status', {
                                    icon: '⚠️', // Optional: you can customize the icon
                                });
                                updateDocumentRequestStatus();
                            }}
                            disabled={isSubmitting}
                        >
                            Save Changes
                        </button>
                    </div>
                </SideModal>
            )}


            <Content.Title
                title="Document Requests"
                subtitle="View and manage all user details and related data"
            />
            <Card>
                <Card.Body title="List of Document Requests" b>
                    <div style={{ width: '100%' }}>
                        <div style={{ height: 680, width: '100%' }}>
                            <DataGrid
                                apiRef={apiRef}
                                loading={isLoading}
                                rows={data ? data.requests : []}
                                columns={[
                                    {
                                        field: 'createdAt',
                                        headerName: 'Request Date',
                                        headerAlign: 'center',
                                        align: 'left',
                                        flex: 1,
                                        renderCell: (params) => (
                                            <div className="text-primary-500"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                }}
                                            >
                                                {format(new Date(params.row.createdAt), 'MMMM d, yyyy')}
                                            </div>
                                        ),
                                    },
                                    {
                                        field: 'requestCode',
                                        headerName: 'Tracking Code',
                                        headerAlign: 'center',
                                        align: 'center',
                                        flex: 1,
                                        renderCell: (params) => (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                    fontWeight: 700,
                                                }}
                                                className='text-primary-500'
                                            >
                                                LP - {params.row.requestCode}
                                            </div>
                                        ),
                                    },
                                    {
                                        field: 'studentFullName',
                                        headerName: 'Student',
                                        headerAlign: 'center',
                                        align: 'center',
                                        flex: 1,
                                        renderCell: (params) => (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                }}
                                            >
                                                {params.row.studentInformation?.studentFullName || 'N/A'}
                                            </div>
                                        ),
                                    },
                                    {
                                        field: 'documents',
                                        headerName: 'Documents',
                                        headerAlign: 'center',
                                        align: 'left',
                                        flex: 1,
                                        renderCell: (params) => {
                                            const documents = params.row.documents || [];
                                            return (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'left',
                                                        justifyContent: 'left',
                                                        width: '100%',
                                                        height: '100%',
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {documents.length > 0 ? (
                                                        <ul
                                                            style={{
                                                                margin: 0,
                                                                paddingLeft: '20px', // Adds indentation for bullets
                                                                textAlign: 'left',   // Aligns text with bullets
                                                            }}
                                                        >
                                                            {documents.map((doc, index) => (
                                                                <li key={index}>
                                                                    - {DOCUMENT_DETAILS[doc.docName]?.label || doc.docName}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </div>
                                            );
                                        },
                                    },
                                    {
                                        field: 'status',
                                        headerName: 'Status',
                                        headerAlign: 'center',
                                        align: 'center',
                                        flex: .8,
                                        renderCell: (params) => (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                }}

                                            >
                                                <span className={`rounded-full py-0.5 text-xs px-2 ${DOC_STATUS_BG_COLOR[params.row.status]
                                                    }`}>
                                                    {DOC_STATUS[params.row.status] || 'N/A'}
                                                </span>
                                            </div>
                                        ),
                                    },
                                    {
                                        field: 'actions',
                                        headerName: 'Actions',
                                        headerAlign: 'center',
                                        align: 'center',
                                        flex: 0.8,
                                        renderCell: (params) => (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                }}
                                            >
                                                <button
                                                    className="px-3 py-1 text-white rounded bg-primary-500 hover:bg-primary-400"
                                                    onClick={() => {
                                                        view(params.row);
                                                    }}
                                                >
                                                    View More
                                                </button>
                                            </div>
                                        ),
                                    }

                                ]}
                                slots={{
                                    toolbar: CustomToolbar,
                                }}
                                autosizeOnMount
                                getRowHeight={() => 'auto'}
                            />

                        </div>
                    </div>
                </Card.Body>
            </Card>
        </AdminLayout>
    );
};

export default DocumentRequest;
