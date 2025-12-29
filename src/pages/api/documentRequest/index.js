import { validateSession } from '@/config/api-validation';
import { getStudentRecords } from '@/prisma/services/student-record';
import crypto from 'crypto';
import prisma from '@/prisma/index';
import { sendMail } from '@/lib/server/mail';
import { DOCUMENT_DETAILS } from '@/utils/constants';
import {
  createDocumentRequest,
  getDocumentRequest,
} from '@/prisma/services/document-request';

const ALLOW_DELETION = true;

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    try {
      const { requestCode } = req.query; // Get requestCode from query params

      const documentRequest = await getDocumentRequest(requestCode);

      // If no document request is found, return a 404 response
      if (!documentRequest) {
        return res.status(404).json({
          success: false,
          message: 'Document request not found.',
        });
      }

      // If documentRequest is found, return it with a 200 response
      res.status(200).json({
        success: true,
        message: 'Document request retrieved.',
        data: {
          documentRequest,
        },
      });
    } catch (error) {
      console.error('Error handling document request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve document request.',
      });
    }
  } else if (method === 'POST') {
    try {
      const {
        selectedPurpose,
        deliveryOption,
        deliveryAddress,
        letterRequestEccd,
        letterRequest137,
        eccdForm,
        affidavit,
        students, // Multiple students
        documents, // Documents grouped by student
        formData2, // For requestor information
        totalFee,
      } = req.body;
      // Map requestor information from formData2
      const requestorInformation = {
        requestorFullName: formData2.requestorName,
        requestorEmail: formData2.email,
        relationshipToStudent: formData2.relationship,
        occupation: formData2.occupation,
        requestorAddress: formData2.guardianAddress,
        requestorMobileNumber: formData2.guardianMobile,
      };

      // Map students information
      const studentsData = students.map((student) => ({
        studentFullName: student.studentFullName,
        lrn: student.lrn,
        currentGradeLevel: student.currentGradeLevel,
        currentSchool: student.currentSchool,
        gradeLevelsWithLp: student.gradeLevelsWithLp,
        lastSchoolYearWithLp: student.lastSchoolYearWithLp,
      }));
      // Map documents for each student
      const documentsData = documents.map((studentDoc) => ({
        studentIndex: studentDoc.studentIndex,
        documents: studentDoc.documents.map((doc) => ({
          docName: doc.docName,
          url: doc.url,
        })),
      }));
      // Map transaction details
      const transaction = {
        email: formData2.email,
        amount: totalFee,
        description: 'Payment for document request',
        source: 'DOCUMENT',
        fee: 'ONLINE',
      };

      async function generateUniqueRequestCode(prisma) {
        let uniqueRequestCode;
        let isUnique = false;

        while (!isUnique) {
          uniqueRequestCode = `${crypto
            .createHash('md5')
            .update(Date.now().toString() + Math.random().toString())
            .digest('hex')
            .substring(0, 6)
            .toUpperCase()}`;

          const existingRequest = await prisma?.documentRequest.findFirst({
            where: { requestCode: uniqueRequestCode },
          });

          if (!existingRequest) {
            isUnique = true;
          }
        }
        return uniqueRequestCode;
      }

      const requestCode = await generateUniqueRequestCode(prisma);
      // Prepare the data object for createDocumentRequest
      const requestData = {
        requestCode: requestCode,
        purpose: selectedPurpose,
        status: 'Pending',
        deliveryAddress: deliveryAddress,
        requestorInformation,
        students: studentsData, // Multiple students
        documents: documentsData, // Documents grouped by student
        transaction,
        deliveryOption,
      };

      // Call the service
      const result = await createDocumentRequest(requestData);

      // Destructure the result to get transaction details
      const {
        requestCode: returnedRequestCode,
        transactionId,
        referenceNumber,
      } = result;
      res.status(201).json({
        success: true,
        message: 'Document request created successfully.',
        data: {
          requestCode: returnedRequestCode,
          transactionId: transactionId,
          referenceNumber: referenceNumber,
        },
      });
    } catch (error) {
      console.error('Error handling document request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create document request.',
      });
    }
  } else if (method === 'DELETE') {
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
