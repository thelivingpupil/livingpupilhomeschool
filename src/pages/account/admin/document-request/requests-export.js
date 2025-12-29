import { CSVLink } from 'react-csv';
import format from 'date-fns/format';
import { TransactionStatus } from '@prisma/client';

import Content from '@/components/Content';
import Meta from '@/components/Meta';
import AdminLayout from '@/layouts/AdminLayout';
import prisma from '@/prisma/index';
import Card from '@/components/Card';

const RequestsExport = ({ data }) => {
    // const headers = [
    //     { key: 'createdAt', label: 'Request Date' },
    //     { key: 'requestCode', label: 'Request Code' },
    //     { key: 'documentCollection', label: 'Document Collection' },
    //     { key: 'status', label: 'Delivery Tracking Number/Link' },
    //     { key: 'deliveryAddress', label: 'Delivery Address' },
    //     { key: 'tracking', label: 'Delivery Tracking Number/Link' },
    //     { 
    //         key: 'studentInformation.studentFullName', 
    //         label: 'Student Full Name' 
    //     },
    //     { 
    //         key: 'studentInformation.lrn', 
    //         label: 'LRN' 
    //     },
    //     {
    //         key: 'studentInformation.currentGradeLevel',
    //         label: 'Current Grade Level'
    //     },
    //     {
    //         key: 'studentInformation.currentSchool',
    //         label: 'Current School'
    //     },
    //     { 
    //         key: 'studentInformation.gradeLevelsWithLp', 
    //         label: 'Grade Levels with LP' 
    //     },
    //     { 
    //         key: 'studentInformation.lastSchoolYearWithLp', 
    //         label: 'Last School Year with LP' 
    //     },
    //     {
    //         key: 'requestorInformation.requestorFullName',
    //         label: 'Requestor Fullname'
    //     },
    //     {
    //         key: 'requestorInformation.relationshipToStudent',
    //         label: 'Relationship to Student'
    //     },
    //     {
    //         key: 'requestorInformation.requestorAddress',
    //         label: 'Address'
    //     },
    //     {
    //         key: 'requestorInformation.requestorEmail',
    //         label: 'Email'
    //     },
    //     {
    //         key: 'requestorInformation.requestorMobileNumber',
    //         label: 'Mobile Number'
    //     },
    //     {
    //         key: 'requestorInformation.occupation',
    //         label: 'Occupation'
    //     },


    // ];

    // const addDocumentHeaders = (documents) => {
    //     if (documents && documents.length > 0) {
    //         documents.forEach((doc, index) => {
    //             headers.push({
    //                 key: `documents[${index}].docName`,
    //                 label: `Document ${index + 1} Name`
    //             });
    //             headers.push({
    //                 key: `documents[${index}].url`,
    //                 label: `Document ${index + 1} URL`
    //             });
    //         });
    //     }
    // };


    // Function to generate headers dynamically
    const generateHeaders = (data) => {

        const baseHeaders = [
            { key: "createdAt", label: "Request Date" },
            { key: "requestCode", label: "Request Code" },
            { key: "documentCollection", label: "Document Collection" },
            { key: "status", label: "Status" },
            { key: "deliveryAddress", label: "Delivery Address" },
            { key: "tracking", label: "Delivery Tracking Number/Link" },
            { key: "studentInformation.studentFullName", label: "Student Full Name" },
            { key: "studentInformation.lrn", label: "LRN" },
            { key: "studentInformation.currentGradeLevel", label: "Current Grade Level" },
            { key: "studentInformation.currentSchool", label: "Current School" },
            { key: "studentInformation.gradeLevelsWithLp", label: "Grade Levels with LP" },
            { key: "studentInformation.lastSchoolYearWithLp", label: "Last School Year with LP" },
            { key: "requestorInformation.requestorFullName", label: "Requestor Full Name" },
            { key: "requestorInformation.relationshipToStudent", label: "Relationship to Student" },
            { key: "requestorInformation.requestorAddress", label: "Address" },
            { key: "requestorInformation.requestorEmail", label: "Email" },
            { key: "requestorInformation.requestorMobileNumber", label: "Mobile Number" },
            { key: "requestorInformation.occupation", label: "Occupation" },
        ];
        // Find the max number of documents
        const maxDocuments = Math.max(...data.map((d) => d.documents?.length || 0), 0);

        // Add dynamic headers for documents
        for (let i = 0; i < maxDocuments; i++) {
            baseHeaders.push({ key: `documents[${i}].docName`, label: `Document ${i + 1} Name` });
            baseHeaders.push({ key: `documents[${i}].url`, label: `Document ${i + 1} URL` });
        }

        return baseHeaders;
    };

    return (
        <AdminLayout>
            <Meta title="Living Pupil Homeschool - Students Export" />
            <Content.Title
                title="Download Document Requests Master List"
                subtitle="Export and download requests list"
            />
            <Content.Divider />
            <CSVLink
                className="items-center px-3 py-3 space-x-2 text-sm text-center text-white rounded bg-primary-500 hover:bg-secondary-500 hover:text-primary-600"
                data={data}
                filename={`requests-export-${format(
                    new Date(),
                    'yyyy.MM.dd.kk.mm.ss'
                )}.csv`}
                headers={generateHeaders(data)}
                asyncOnClick
            >
                Download Document Requests Master List
            </CSVLink>
            <Card>
                <Card.Body title="Current Students Statistics"></Card.Body>
            </Card>
        </AdminLayout>
    );
};

export const getServerSideProps = async () => {
    const data = await prisma.documentRequest.findMany({
        where: {
            deletedAt: null, // Ensures only non-deleted records are fetched
        },
        include: {
            requestorInformation: true, // Include related RequestorInformation
            studentInformation: true,   // Include related StudentInformation
            documents: true,            // Include all related Documents
            transaction: true,          // Include Transaction details if available
        },
        orderBy: {
            createdAt: 'desc', // Order by creation date in descending order (newest first)
        },
    });


    return { props: { data: JSON.parse(JSON.stringify(data)) } };
};

export default RequestsExport;
