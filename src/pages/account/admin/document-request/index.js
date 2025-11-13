import React from 'react';
import { useState, useEffect } from 'react';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  useGridApiRef,
  DEFAULT_GRID_AUTOSIZE_OPTIONS,
} from '@mui/x-data-grid';
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
import CenteredModal from '@/components/Modal/centered-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import { useDocuments } from '@/hooks/data';
import toast from 'react-hot-toast';
import {
  DOCUMENT_DETAILS,
  STATUS_BG_COLOR,
  PURPOSE_OPTIONS,
  DOC_STATUS,
  DOC_STATUS_BG_COLOR,
} from '@/utils/constants';
import { STATUS_CODES } from '@/lib/server/dragonpay';
import { TransactionStatus } from '@prisma/client';
import { ChevronDownIcon } from '@heroicons/react/outline';
import api from '@/lib/common/api';
import { format } from 'date-fns';

const DocumentRequest = () => {
  const { data, isLoading } = useDocuments();
  const [showModal, setModalVisibility] = useState(false);
  const [isSubmitting, setSubmittingState] = useState(false);
  const [docStatus, setDocStatus] = useState('');
  const [showUpdateRequestStatusModal, setUpdateRequestStatusModalVisibility] =
    useState(false);
  const apiRef = useGridApiRef();
  const [document, setDocument] = useState(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [region, setRegion] = useState('');
  const [courier, setCourier] = useState('');

  // Payment status update states
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);

  // Function to flatten the document request data
  const flattenDocumentRequests = (requests) => {
    if (!requests || !Array.isArray(requests)) return [];

    return requests.map((request) => ({
      // Main document request fields
      id: request.id,
      requestCode: request.requestCode,
      purpose: request.purpose,
      status: request.status,
      deliveryAddress: request.deliveryAddress,
      documentCollection: request.documentCollection,
      tracking: request.tracking,
      region: request.region,
      courier: request.courier,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,

      // Flattened student information (handle multiple students)
      studentFullName:
        request.studentInformation && request.studentInformation.length > 0
          ? request.studentInformation.map((s) => s.studentFullName).join(', ')
          : 'N/A',
      studentLrn:
        request.studentInformation && request.studentInformation.length > 0
          ? request.studentInformation.map((s) => s.lrn).join(', ')
          : 'N/A',
      studentCurrentGradeLevel:
        request.studentInformation && request.studentInformation.length > 0
          ? request.studentInformation
              .map((s) => s.currentGradeLevel)
              .join(', ')
          : 'N/A',
      studentCurrentSchool:
        request.studentInformation && request.studentInformation.length > 0
          ? request.studentInformation.map((s) => s.currentSchool).join(', ')
          : 'N/A',
      studentGradeLevelsWithLp:
        request.studentInformation && request.studentInformation.length > 0
          ? request.studentInformation
              .map((s) => s.gradeLevelsWithLp)
              .join(', ')
          : 'N/A',
      studentLastSchoolYearWithLp:
        request.studentInformation && request.studentInformation.length > 0
          ? request.studentInformation
              .map((s) => s.lastSchoolYearWithLp)
              .join(', ')
          : 'N/A',

      // Flattened requestor information
      requestorFullName:
        request.requestorInformation?.requestorFullName || 'N/A',
      requestorEmail: request.requestorInformation?.requestorEmail || 'N/A',
      requestorRelationship:
        request.requestorInformation?.relationshipToStudent || 'N/A',
      requestorOccupation: request.requestorInformation?.occupation || 'N/A',
      requestorAddress: request.requestorInformation?.requestorAddress || 'N/A',
      requestorMobileNumber:
        request.requestorInformation?.requestorMobileNumber || 'N/A',

      // Flattened transaction information
      transactionPaymentReference:
        request.transaction?.paymentReference || 'N/A',
      transactionAmount: request.transaction?.amount || 'N/A',
      transactionStatus: request.transaction?.paymentStatus || 'N/A',

      // Keep original nested objects for modal display
      originalData: request,
    }));
  };

  // Get flattened data for the table
  const flattenedData = flattenDocumentRequests(data?.requests || []);

  // Validate and clean the data
  const validatedData = flattenedData.map((item) => ({
    ...item,
    studentFullName: item.studentFullName || 'N/A',
    requestCode: item.requestCode || 'N/A',
    status: item.status || 'N/A',
    id: item.id || Math.random().toString(36).substr(2, 9),
  }));

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    );
  }

  const view = (documentData) => {
    toggleModal();
    setDocument(documentData);
  };

  const handleTrackingCodeChange = (e) => {
    setTrackingCode(e.target.value);
  };

  const handleDropdownChange = (event) => {
    setRegion(event.target.value);
  };

  const handleCourierChange = (event) => {
    setCourier(event.target.value);
  };

  const toggleModal = () => setModalVisibility(!showModal);
  const toggleUpdateRequestStatusModal = () =>
    setUpdateRequestStatusModalVisibility(!showUpdateRequestStatusModal);

  const viewUpdateDocumentRequestStatus = (documentData) => {
    toggleUpdateRequestStatusModal();
    setDocument(documentData);
  };

  const updateDocumentRequestStatus = () => {
    setSubmittingState(true);
    api('/api/documentRequest/getDocs', {
      body: {
        requestCode: document.requestCode,
        status: docStatus,
        email: document.requestorInformation.requestorEmail,
        requestorFullName: document.requestorInformation.requestorFullName,
        studentFullName:
          document.studentInformation && document.studentInformation.length > 0
            ? document.studentInformation
                .map((s) => s.studentFullName)
                .join(', ')
            : 'N/A',
        document: document.documents,
        documentCollection: document.documentCollection,
        trackingCode: trackingCode,
        region: region,
        courier: courier,
      },
      method: 'PATCH',
    })
      .then((response) => {
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
      .catch((error) => {
        setSubmittingState(false);
        toast.error(`Error updating document request status: ${error.message}`);
      });
  };

  // Payment status update functions
  const viewPaymentDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowPaymentDetails(true);
  };

  const togglePaymentDetailsModal = () => {
    setShowPaymentDetails(!showPaymentDetails);
    if (!showPaymentDetails) {
      setSelectedTransaction(null);
    }
  };

  const updatePaymentStatus = async () => {
    if (!selectedTransaction) return;

    try {
      setIsUpdatingPaymentStatus(true);
      const response = await fetch(
        '/api/admin/transactions/update-payment-status',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId: selectedTransaction.transactionId,
            paymentStatus: 'S',
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Payment status updated successfully!');
        togglePaymentDetailsModal();
        // Refresh the data
        window.location.reload();
      } else {
        toast.error(
          `Error updating payment status: ${data.errors?.error?.msg}`
        );
      }
    } catch (error) {
      toast.error('Failed to update payment status');
    } finally {
      setIsUpdatingPaymentStatus(false);
    }
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
              <strong>Request Date:</strong>{' '}
              {format(new Date(document.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="mt-1">
            <p>
              <strong>Purpose:</strong>{' '}
              {PURPOSE_OPTIONS.find(
                (option) => option.value === document.purpose
              )?.label || 'Not Selected'}
            </p>
          </div>

          <div>
            <p className="font-bold text-blue-600 text-sm">
              Student Information
            </p>
            {document?.studentInformation &&
            document.studentInformation.length > 0 ? (
              document.studentInformation.map((student, index) => (
                <div
                  key={student.id}
                  className="px-3 text-sm mb-4 p-3 bg-gray-50 rounded-lg"
                >
                  <p className="font-semibold text-gray-800 mb-2">
                    Student {index + 1}:
                  </p>
                  <p>
                    <strong>Student Full Name:</strong>{' '}
                    {student.studentFullName || 'N/A'}
                  </p>
                  <p>
                    <strong>LRN:</strong> {student.lrn || 'N/A'}
                  </p>
                  <p>
                    <strong>Grade Level:</strong>{' '}
                    {student.currentGradeLevel || 'N/A'}
                  </p>
                  <p>
                    <strong>Current School:</strong>{' '}
                    {student.currentSchool || 'N/A'}
                  </p>
                  <p>
                    <strong>Grades With LP:</strong>{' '}
                    {student.gradeLevelsWithLp || 'N/A'}
                  </p>
                  <p>
                    <strong>Last School Year:</strong>{' '}
                    {student.lastSchoolYearWithLp || 'N/A'}
                  </p>

                  {/* Student's Documents */}
                  <div className="mt-3">
                    <p className="font-semibold text-gray-700 mb-2">
                      Documents:
                    </p>
                    {document?.documents &&
                    document.documents.filter(
                      (doc) => doc.studentId === student.id
                    ).length > 0 ? (
                      <ul className="list-disc list-inside text-gray-600">
                        {document.documents
                          .filter((doc) => doc.studentId === student.id)
                          .map((doc) => (
                            <li key={doc.id}>
                              {DOCUMENT_DETAILS[doc.docName]?.label ||
                                doc.docName}
                              <div className="ml-5">
                                {doc.url &&
                                  doc.url !== 'N/A' &&
                                  doc.url.split(', ').map(
                                    (url, index) =>
                                      url &&
                                      url !== 'N/A' && (
                                        <a
                                          key={index}
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-500 underline block"
                                        >
                                          View Document {index + 1}
                                        </a>
                                      )
                                  )}
                              </div>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">
                        No documents uploaded yet
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 text-sm">
                <p className="text-gray-500 italic">
                  No student information available
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="font-bold text-blue-600 text-sm">
              Requestor/Guardian Information
            </p>
            <div className="px-3 text-sm">
              <p>
                <strong>Requestor Full Name:</strong>{' '}
                {document?.requestorInformation.requestorFullName}
              </p>
              <p>
                <strong>Relationship:</strong>{' '}
                {document?.requestorInformation.relationshipToStudent}
              </p>
              <p>
                <strong>Email:</strong>{' '}
                {document?.requestorInformation.requestorEmail}
              </p>
              <p>
                <strong>Occupation:</strong>{' '}
                {document?.requestorInformation.occupation}
              </p>
              <p>
                <strong>Guardian Address:</strong>{' '}
                {document?.requestorInformation.requestorAddress}
              </p>
              <p>
                <strong>Guardian Mobile:</strong>{' '}
                {document?.requestorInformation.requestorMobileNumber}
              </p>
            </div>
          </div>

          <div>
            <p className="font-bold text-blue-600 text-sm">
              Document Collection
            </p>
            <div className="px-3 text-sm">
              <p>
                <strong>Document Collection:</strong>{' '}
                {document?.documentCollection?.charAt(0).toUpperCase() +
                  document?.documentCollection?.slice(1).toLowerCase()}
              </p>
              <p>
                <strong>Delivery Address:</strong>{' '}
                {document?.deliveryAddress === ''
                  ? 'N/A'
                  : document?.deliveryAddress}
              </p>
            </div>
          </div>

          <div class="mt-6">
            <div className="flex items-center space-x-5">
              {document?.transaction?.paymentReference ? (
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
                    No payment reference available
                  </span>
                </h4>
              )}
              <div className="flex items-center space-x-5">
                <h6>
                  {new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(document?.transaction?.amount || 0)}
                </h6>
              </div>
              {document?.transaction && (
                <span
                  className={`rounded-full py-0.5 text-sm px-2 ${
                    STATUS_BG_COLOR[document?.transaction.paymentStatus]
                  }`}
                >
                  {STATUS_CODES[document?.transaction.paymentStatus]}
                </span>
              )}
            </div>
            {document?.transaction && (
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => viewPaymentDetails(document.transaction)}
                  className="px-3 py-1 text-white rounded bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  View Payment Details
                </button>
              </div>
            )}
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
              <h4 className="font-bold text-gray-600">
                Current Status: {DOC_STATUS[document.status]}
              </h4>
              <label className="text-lg font-bold" htmlFor="txtMother">
                Document Request Status{' '}
                <span className="ml-1 text-red-600">*</span>
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
                  <label
                    className="text-sm font-medium mb-2"
                    htmlFor="txtMother"
                  >
                    Delivery Region <span className="ml-1 text-red-600">*</span>
                  </label>
                  <div
                    className={`relative inline-block w-full rounded ${
                      region === '' ? 'border-red-500 border-2' : 'border'
                    }`}
                  >
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
                <>
                  <div className="flex flex-col space-x-0 space-y-5 md:flex-row md:space-x-5 md:space-y-0">
                    <div className={`flex flex-col w-full`}>
                      <label
                        className="text-sm font-medium mb-2"
                        htmlFor="txtMother"
                      >
                        Courier <span className="ml-1 text-red-600">*</span>
                      </label>
                      <div
                        className={`relative inline-block w-full rounded ${
                          courier === '' ? 'border-red-500 border-2' : 'border'
                        }`}
                      >
                        <select
                          className="w-full px-3 py-2 capitalize rounded appearance-none"
                          value={courier}
                          onChange={handleCourierChange}
                        >
                          <option value="">--Select Courier--</option>
                          <option value="spx">SPX</option>
                          <option value="lc">LBC</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronDownIcon className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 mb-4">
                    <label
                      htmlFor="deliveryAddress"
                      className={`block text-sm font-medium`}
                    >
                      Tracking Code/Link
                    </label>
                    <input
                      type="text"
                      id="trackingCodeLBC"
                      value={trackingCode}
                      onChange={handleTrackingCodeChange}
                      className={`mt-2 w-full p-2 border border-gray-300 rounded-md ${
                        trackingCode === ''
                          ? 'border-red-500 border-2'
                          : 'border'
                      }`}
                    />
                  </div>
                </>
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
        <Card.Body title="List of Document Requests">
          <div>
            <Link href="/account/admin/document-request/requests-export">
              <a className="items-center px-3 py-2 space-x-2 text-sm text-white rounded bg-primary-500 hover:bg-primary-600">
                Generate Document Requests Master List
              </a>
            </Link>
          </div>
          <div style={{ width: '100%' }}>
            <div style={{ height: 680, width: '100%' }}>
              <DataGrid
                apiRef={apiRef}
                loading={isLoading}
                rows={validatedData}
                getRowId={(row) => row.id}
                filterMode="client"
                disableColumnFilter={false}
                disableColumnMenu={false}
                initialState={{
                  sorting: {
                    sortModel: [
                      {
                        field: 'createdAt',
                        sort: 'desc',
                      },
                    ],
                  },
                }}
                columns={[
                  {
                    field: 'createdAt',
                    headerName: 'Request Date',
                    headerAlign: 'center',
                    align: 'left',
                    flex: 1,
                    renderCell: (params) => (
                      <div
                        className="text-primary-500"
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
                    filterable: true,
                    type: 'string',
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
                        className="text-primary-500"
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
                    filterable: true,
                    type: 'string',
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
                        {params.row.studentFullName}
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
                      const documents = params.row.originalData.documents || [];
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
                                textAlign: 'left', // Aligns text with bullets
                              }}
                            >
                              {documents.map((doc, index) => (
                                <li key={index}>
                                  -{' '}
                                  {DOCUMENT_DETAILS[doc.docName]?.label ||
                                    doc.docName}
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
                    flex: 0.8,
                    filterable: true,
                    type: 'string',
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
                        <span
                          className={`rounded-full py-0.5 text-xs px-2 ${
                            DOC_STATUS_BG_COLOR[params.row.status]
                          }`}
                        >
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
                            view(params.row.originalData);
                          }}
                        >
                          View More
                        </button>
                      </div>
                    ),
                  },
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

      {/* Payment Details Modal */}
      {selectedTransaction && (
        <CenteredModal
          show={showPaymentDetails}
          toggle={togglePaymentDetailsModal}
          title="Payment Details"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                Transaction Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Transaction ID:</span>
                  <span className="font-mono">
                    {selectedTransaction.transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Reference Number:</span>
                  <span className="font-mono">
                    {selectedTransaction.referenceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="font-bold text-green-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(selectedTransaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payment Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      STATUS_BG_COLOR[selectedTransaction.paymentStatus]
                    }`}
                  >
                    {STATUS_CODES[selectedTransaction.paymentStatus]}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Proof Section */}
            {selectedTransaction.paymentProofLink && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Payment Proof
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Uploaded:</span>
                    <span className="text-sm font-medium text-green-600">
                      ✓ Available
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={selectedTransaction.paymentProofLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Payment Proof
                    </a>
                    <a
                      href={selectedTransaction.paymentProofLink}
                      download
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            )}

            {!selectedTransaction.paymentProofLink && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Payment Proof
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-sm font-medium text-red-600">
                    ✗ Not uploaded
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  No payment proof has been uploaded for this transaction.
                </p>
              </div>
            )}

            {/* Update Payment Status Section */}
            {selectedTransaction.paymentStatus !== 'S' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Update Payment Status
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Mark this payment as successful after verifying the payment
                  proof.
                </p>
                <button
                  onClick={updatePaymentStatus}
                  disabled={isUpdatingPaymentStatus}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdatingPaymentStatus ? 'Updating...' : 'Mark as Paid'}
                </button>
              </div>
            )}

            {selectedTransaction.paymentStatus === 'S' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  Payment Status
                </h4>
                <p className="text-sm text-green-700">
                  This payment has been marked as successful.
                </p>
              </div>
            )}
          </div>
        </CenteredModal>
      )}
    </AdminLayout>
  );
};

export default DocumentRequest;
