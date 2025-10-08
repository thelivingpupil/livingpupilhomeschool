import api from '@/lib/common/api';
import prisma from '@/prisma/index';
import { v4 as uuidv4 } from 'uuid'; // Import UUID if using UUID
import { getBasicAuthorization } from '@/lib/server/dragonpay';
import { add } from 'date-fns';
import {
  Currency,
  Fees,
  TransactionSource,
  TransactionStatus,
} from '@prisma/client';

//single document for tracking
export const getDocumentRequest = async (requestCode) => {
  try {
    const documentRequest = await prisma.documentRequest.findUnique({
      where: {
        requestCode, // Find the specific record using the unique requestCode
      },
      include: {
        requestorInformation: true, // Include related RequestorInformation
        studentInformation: true, // Include related StudentInformation
        documents: true, // Include all related Documents
        transaction: true, // Include Transaction details if available
      },
    });

    if (!documentRequest) {
      return; // Return message if not found
    }

    return documentRequest; // Return the found DocumentRequest
  } catch (error) {
    console.error('Error fetching document request:', error.message);
    throw new Error('Could not fetch document request. Please try again.');
  }
};

// all document requests for admin
export const getDocumentRequests = async () => {
  try {
    const documentRequests = await prisma.documentRequest.findMany({
      where: {
        deletedAt: null, // Only get non-deleted records
      },
      include: {
        requestorInformation: true, // Include related RequestorInformation
        studentInformation: true, // Include related StudentInformation
        documents: true, // Include all related Documents
        transaction: true, // Include Transaction details if available
      },
      orderBy: {
        createdAt: 'desc', // Order by creation date in descending order (newest first)
      },
    });

    if (!documentRequests || documentRequests.length === 0) {
      return []; // Return an empty array if no records are found
    }

    return documentRequests; // Return the list of DocumentRequests
  } catch (error) {
    console.error('Error fetching document requests:', error.message);
    throw new Error('Could not fetch document requests. Please try again.');
  }
};

export const createDocumentRequest = async (data) => {
  try {
    const {
      requestCode,
      purpose,
      status,
      deliveryAddress,
      requestorInformation,
      students,
      documents,
      transaction,
      deliveryOption,
    } = data;

    // Create requestor information if it exists (now that DocumentRequest exists)
    if (requestorInformation) {
      await createRequestorInformation(
        prisma,
        requestCode,
        requestorInformation
      );
    }
    // Create the main document request record FIRST (before dependent records)
    const documentRequest = await createDocumentRequestRecord(prisma, {
      requestCode,
      purpose,
      status,
      deliveryAddress,
      transactionId: null,
      deliveryOption,
    });

    // Create student information for each student
    const createdStudents = [];
    if (students && students.length > 0) {
      for (const studentInfo of students) {
        const student = await createStudentInformation(
          prisma,
          requestCode,
          studentInfo
        );
        createdStudents.push(student);
      }
    }

    // Handle transaction creation if provided
    let transactionId = null;
    let referenceNumber = null;
    if (transaction) {
      const {
        transactionId: createdTransactionId,
        referenceNumber: createdReferenceNumber,
      } = await createTransactionForDocumentRequest(
        transaction.email,
        transaction.amount,
        transaction.description,
        transaction.source,
        transaction.fee
      );
      transactionId = createdTransactionId;
      referenceNumber = createdReferenceNumber;

      // Update the document request with the transaction ID
      await prisma.documentRequest.update({
        where: { requestCode },
        data: { transactionId },
      });
    }

    // Create documents for each student
    if (documents && documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const studentDoc = documents[i];
        if (
          studentDoc.studentIndex !== undefined &&
          createdStudents[studentDoc.studentIndex]
        ) {
          await createDocuments(
            prisma,
            requestCode,
            studentDoc.documents,
            createdStudents[studentDoc.studentIndex].id
          );
        }
      }
    }

    console.log('Document request created successfully:', {
      requestCode,
      transactionId,
      referenceNumber,
      studentCount: createdStudents.length,
    });

    return { requestCode, transactionId, referenceNumber }; // Return transaction details instead of URL
  } catch (error) {
    console.error('Error creating document request:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const createDocumentRequestRecord = async (prisma, data) => {
  console.log('Creating document request record with data:', data);
  return await prisma.documentRequest.create({
    data: {
      requestCode: data.requestCode,
      purpose: data.purpose,
      status: data.status,
      documentCollection: data.deliveryOption,
      deliveryAddress: data.deliveryAddress || '',
      transactionId: data.transactionId, // ✅ ADD THIS LINE to link to transaction
    },
  });
};

export const createRequestorInformation = async (prisma, requestCode, data) => {
  return await prisma.requestorInformation.create({
    data: {
      requestCode,
      ...data,
    },
  });
};

export const createStudentInformation = async (
  prisma,
  requestCode,
  studentInformation
) => {
  return await prisma.studentInformation.create({
    data: {
      requestCode: requestCode,
      ...studentInformation,
    },
  });
};

export const createDocuments = async (
  prisma,
  requestCode,
  documents,
  studentId = null
) => {
  // Ensure documents is always an array
  const documentsArray = Array.isArray(documents) ? documents : [documents];

  return await Promise.all(
    documentsArray.map((doc) =>
      prisma.documents.create({
        data: {
          requestCode: requestCode,
          docName: doc.docName,
          url: doc.url,
          studentId: studentId, // Link document to specific student
          createdAt: new Date(),
        },
      })
    )
  );
};

export const createTransactionForDocumentRequest = async (
  email,
  amount,
  description,
  source,
  fee
) => {
  const transactionId = uuidv4();
  const referenceNumber = `DOC-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;

  await prisma.transaction.create({
    data: {
      transactionId,
      referenceNumber,
      amount,
      transactionStatus: 'P',
      paymentStatus: 'P',
      source: source || description,
      description,
      message: 'Payment pending - QR code payment',
      url: 'QR_PAYMENT',
      fee,
    },
  });

  return { transactionId, referenceNumber };
};

export const createTransaction = async (
  email,
  amount,
  description,
  source,
  fee
) => {
  const transactionId = uuidv4();
  if (amount === 0) {
    await prisma.transaction.create({
      data: {
        transactionId,
        referenceNumber: transactionId,
        amount,
        transactionStatus: 'S',
        paymentStatus: 'S',
        source: source || description,
        description,
        message: '',
        url: 'N/A',
        fee,
      },
    });
    return { url: 'N/A', referenceNumber: '', transactionId };
  } else {
    const response = await api(
      `${process.env.PAYMENTS_BASE_URL}/${transactionId}/post`,
      {
        body: {
          Amount: amount,
          Currency: Currency.PHP,
          Description: description,
          Email: email,
          Expiry: add(new Date(), { years: 1 }),
        },
        headers: {
          Authorization: `${getBasicAuthorization()}`,
        },
        method: 'POST',
      }
    );

    const {
      RefNo: referenceNumber,
      Status: transactionStatus,
      Message: message,
      Url: url,
    } = response;
    await prisma.transaction.create({
      data: {
        transactionId,
        referenceNumber,
        amount,
        transactionStatus,
        source: source || description,
        description,
        message,
        url: `${url}`,
        fee,
      },
    });
    return { url: `${url}`, referenceNumber, transactionId };
  }
};

export const updateDocumentRequestStatus = async (requestCode, status) => {
  await prisma.documentRequest.update({
    data: {
      status: status,
    },
    where: { requestCode },
  });
};

export const updateDocumentRequestTrackingCode = async (
  requestCode,
  tracking
) => {
  await prisma.documentRequest.update({
    data: {
      tracking: tracking,
    },
    where: { requestCode },
  });
};
