import api from '@/lib/common/api';
import prisma from '@/prisma/index';
import { v4 as uuidv4 } from "uuid"; // Import UUID if using UUID
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
                studentInformation: true,   // Include related StudentInformation
                documents: true,            // Include all related Documents
                transaction: true,          // Include Transaction details if available
            },
        });

        if (!documentRequest) {
            return; // Return message if not found
        }

        return documentRequest; // Return the found DocumentRequest
    } catch (error) {
        console.error("Error fetching document request:", error.message);
        throw new Error("Could not fetch document request. Please try again.");
    }
};

// all document requests for admin
export const getDocumentRequests = async () => {
    try {
        const documentRequests = await prisma.documentRequest.findMany({
            include: {
                requestorInformation: true, // Include related RequestorInformation
                studentInformation: true,   // Include related StudentInformation
                documents: true,            // Include all related Documents
                transaction: true,          // Include Transaction details if available
            },
            orderBy: {
                updatedAt: 'desc', // Order by updatedAt in descending order
            },
        });

        if (!documentRequests || documentRequests.length === 0) {
            return []; // Return an empty array if no records are found
        }

        return documentRequests; // Return the list of DocumentRequests
    } catch (error) {
        console.error("Error fetching document requests:", error.message);
        throw new Error("Could not fetch document requests. Please try again.");
    }
};



export const createDocumentRequest = async (data) => {
    try {
        const { requestCode, purpose, status, deliveryAddress, requestorInformation, studentInformation, documents, transaction, deliveryOption } = data;

        // Create requestor information if it exists
        if (requestorInformation) {
            await createRequestorInformation(prisma, requestCode, requestorInformation);
        }

        // Create student information if it exists
        if (studentInformation) {
            await createStudentInformation(prisma, requestCode, studentInformation);
        }

        // Handle transaction creation if provided
        let transactionId = null;
        let transactionUrl = null;
        if (transaction) {
            const { url, transactionId: createdTransactionId } = await createTransaction(
                transaction.email,
                transaction.amount,
                transaction.description,
                transaction.source,
                transaction.fee
            );
            transactionUrl = url;
            transactionId = createdTransactionId; // Capture the transactionId to connect later
        }

        // Create the main document request record
        const documentRequest = await createDocumentRequestRecord(prisma, { requestCode, purpose, status, deliveryAddress, transactionId, deliveryOption });

        // Create documents if they exist
        if (documents && documents.length > 0) {
            await createDocuments(prisma, requestCode, documents);
        }

        console.log("Document request created successfully:", { requestCode, transactionUrl });

        return { requestCode, transactionUrl }; // Return both requestCode and transactionUrl
    } catch (error) {
        console.error("Error creating document request:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

export const createDocumentRequestRecord = async (prisma, data) => {
    return await prisma.documentRequest.create({
        data: {
            purpose: data.purpose,
            status: data.status,
            documentCollection: data.deliveryOption,
            requestorInformation: {
                connect: {
                    requestCode: data.requestCode, // Ensure requestCode is passed here correctly
                },
            },
            studentInformation: {
                connect: {
                    requestCode: data.requestCode, // Ensure requestCode is passed here correctly
                },
            },
            transaction: {
                connect: {
                    transactionId: data.transactionId, // Ensure requestCode is passed here correctly
                },
            },
            deliveryAddress: data.deliveryAddress || "", // Ensure a valid value for deliveryAddress
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

export const createStudentInformation = async (prisma, requestCode, studentInformation) => {
    return await prisma.studentInformation.create({
        data: {
            requestCode: requestCode,
            ...studentInformation
        },
    });
};

export const createDocuments = async (prisma, requestCode, documents) => {
    // Ensure documents is always an array
    const documentsArray = Array.isArray(documents) ? documents : [documents];

    return await Promise.all(
        documentsArray.map((doc) =>
            prisma.documents.create({
                data: {
                    docName: doc.docName,
                    url: doc.url,
                    createdAt: new Date(),
                    DocumentRequest: {
                        connect: {
                            requestCode: requestCode,
                        },
                    },
                },
            })
        )
    );
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
                transactionStatus: "S",
                paymentStatus: "S",
                source: source || description,
                description,
                message: "",
                url: "N/A",
                fee,
            },
        });
        return { url: "N/A", referenceNumber: "", transactionId };
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
        where: { requestCode }
    })
}

export const updateDocumentRequestTrackingCode = async (requestCode, tracking) => {
    await prisma.documentRequest.update({
        data: {
            tracking: tracking,
        },
        where: { requestCode }
    })
}