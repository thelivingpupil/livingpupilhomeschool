import { getDocumentRequests, updateDocumentRequestStatus, updateDocumentRequestTrackingCode } from "@/prisma/services/document-request";
import { validateSession } from "@/config/api-validation";
import { sendMail } from '@/lib/server/mail';
import {
    html as receivedHtml,
    text as receivedText,
} from '@/config/email-templates/document-request/received';
import {
    html as progressHtml,
    text as progressText,
} from '@/config/email-templates/document-request/inProgress';
import {
    html as withinCebuHtml,
    text as withinCebuText,
} from '@/config/email-templates/document-request/deliveryWithinCebu';
import {
    html as outsideCebuHtml,
    text as outsideCebuText,
} from '@/config/email-templates/document-request/deliveryOutsideCebu';
import {
    html as pickUpHtml,
    text as pickUpText,
} from '@/config/email-templates/document-request/pickUp';
import {
    html as receiptHtml,
    text as receiptText,
} from '@/config/email-templates/document-request/documentReceipt';
import {
    html as docReceivedHtml,
    text as docReceivedText,
} from '@/config/email-templates/document-request/documentReceived';
const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        try {
            await validateSession(req, res);
            const requests = await getDocumentRequests();
            res.status(200).json({ data: { requests } });
        } catch (error) {
            console.error('Error handling document requests:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve document requests.',
            });
        }
    } else if (method === 'POST') {
        try {
            const {
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
            } = req.body;

            // Map student information from formData
            const studentInformation = {
                studentFullName: formData.studentName,
                lrn: formData.lrn,
                currentGradeLevel: formData.gradeLevel,
                currentSchool: formData.currentSchool,
                gradeLevelsWithLp: formData.gradesWithLP,
                lastSchoolYearWithLp: formData.lastSchoolYear,
            };


            // Map requestor information from formData2
            const requestorInformation = {
                requestorFullName: formData2.requestorName,
                requestorEmail: formData2.email,
                relationshipToStudent: formData2.relationship,
                occupation: formData2.occupation,
                requestorAddress: formData2.guardianAddress,
                requestorMobileNumber: formData2.guardianMobile,
            };

            // Map documents
            const documents = selectedDocuments.map((doc) => {
                const details = DOCUMENT_DETAILS[doc]; // Lookup the document details by its value
                let url = "N/A"; // Default to N/A

                if (doc === "re_form_138") {
                    url = affidavit;
                } else if (doc === "form_137") {
                    url = letterRequest137;
                } else if (doc === "eccd") {
                    url = [letterRequestEccd, eccdForm].filter(Boolean).join(", "); // Join available parts with a comma
                }

                return {
                    docName: details.value,
                    url,
                    fee: details.fee,
                    requirement: typeof details.requirement === "string" ? details.requirement : JSON.stringify(details.requirement), // Convert object to string if necessary
                    processingTime: details.processing_time,
                };
            });

            // Map transaction details
            const transaction = {
                email: formData2.email,
                amount: totalFee,
                description: 'Payment for document request',
                source: 'DOCUMENT',
                fee: 'ONLINE'
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
                requestCode: requestCode, // Example unique request code
                purpose: selectedPurpose,
                status: 'Pending',
                deliveryAddress: deliveryOption === 'Delivery' ? deliveryAddress : null,
                requestorInformation,
                studentInformation,
                documents,
                transaction,
            };

            // Call the service
            const result = await createDocumentRequest(requestData);

            // Destructure the result to get both requestCode and transactionUrl
            const { requestCode: returnedRequestCode, transactionUrl } = result;


        } catch (error) {
            console.error('Error handling document request:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create document request.',
            });
        }
    } else if (method === 'PATCH') {
        try {
            const {
                requestCode,
                status,
                email,
                requestorFullName,
                studentFullName,
                document,
                documentCollection,
                trackingCode,
                region,
                courier
            } = req.body;

            if (requestCode === null) {
                return res.status(400).json({ error: 'Request code required' });
            }

            switch (status) {
                case 'Received': // Case for 'Received'
                    // Update the document request status
                    await updateDocumentRequestStatus(requestCode, status);
                    await sendMail({
                        from: process.env.EMAIL_FROM,
                        html: receivedHtml({
                            requestorFullName,
                            studentFullName,
                            document
                        }),
                        subject: `Acknowledgment of Your Document Request`,
                        text: receivedText({
                            email,
                        }),
                        to: [email],
                        replyTo: process.env.ADMIN_EMAIL,
                    });
                    break;

                case 'In_Progress': // Case for 'In Progress'
                    // Update the document request status
                    await updateDocumentRequestStatus(requestCode, status);
                    await sendMail({
                        from: process.env.EMAIL_FROM,
                        html: progressHtml({
                            requestorFullName,
                            studentFullName,
                            document
                        }),
                        subject: `Update on Your Document Request for ${studentFullName}`,
                        text: progressText({
                            email,
                        }),
                        to: [email],
                        replyTo: process.env.ADMIN_EMAIL,
                    });
                    break;

                case 'For_Delivery': // Case for 'For Delivery'
                    // Update the document request status
                    await updateDocumentRequestStatus(requestCode, status);
                    if (region === 'outside-cebu') {
                        await updateDocumentRequestTrackingCode(requestCode, trackingCode);
                        await sendMail({
                            from: process.env.EMAIL_FROM,
                            html: outsideCebuHtml({
                                requestorFullName,
                                studentFullName,
                                document,
                                trackingCode,
                                courier
                            }),
                            subject: `Documents Shipped for ${studentFullName}`,
                            text: outsideCebuText({ email }),
                            to: [email],
                            replyTo: process.env.ADMIN_EMAIL,
                        });
                    } else if (region === 'within-cebu') {
                        await sendMail({
                            from: process.env.EMAIL_FROM,
                            html: withinCebuHtml({
                                requestorFullName,
                                studentFullName,
                                document,
                            }),
                            subject: `Action Needed: Documents Ready for Delivery for ${studentFullName}`,
                            text: withinCebuText({ email }),
                            to: [email],
                            replyTo: process.env.ADMIN_EMAIL,
                        });
                    } else {
                        console.error('Invalid region for delivery');
                    }
                    break;

                case 'For_Pickup':
                    // Update the document request status
                    await updateDocumentRequestStatus(requestCode, status);
                    await sendMail({
                        from: process.env.EMAIL_FROM,
                        html: pickUpHtml({
                            requestorFullName,
                            studentFullName,
                            document,
                        }),
                        subject: `Notification: Documents Ready for Pick-Up for ${studentFullName}`,
                        text: pickUpText({ email }),
                        to: [email],
                        replyTo: process.env.ADMIN_EMAIL,
                    });
                    break;

                case 'For_Document_Receipt': // Case for 'For Document Receipt'
                    // Update the document request status
                    await updateDocumentRequestStatus(requestCode, status);
                    await sendMail({
                        from: process.env.EMAIL_FROM,
                        html: receiptHtml({
                            requestorFullName,
                            studentFullName,
                            document,
                        }),
                        subject: `Follow-Up: Confirmation of Document Receipt for ${studentFullName}`,
                        text: receiptText({ email }),
                        to: [email],
                        replyTo: process.env.ADMIN_EMAIL,
                    });
                    break;

                case 'For_Document_Received': // Case for 'For Document Receipt'
                    // Update the document request status
                    await updateDocumentRequestStatus(requestCode, "Completed");
                    await sendMail({
                        from: process.env.EMAIL_FROM,
                        html: docReceivedHtml({
                            requestorFullName,
                            studentFullName,
                        }),
                        subject: `Thank You for Confirming Document Receipt for ${studentFullName}`,
                        text: docReceivedText({ email }),
                        to: [email],
                        replyTo: process.env.ADMIN_EMAIL,
                    });
                    break;

                case 'Completed': // Case for 'For Document Receipt'
                    // Update the document request status
                    await updateDocumentRequestStatus(requestCode, status);
                    break;

                case 'Cancelled': // Case for 'For Document Receipt'
                    // Update the document request status
                    await updateDocumentRequestStatus(requestCode, status);
                    break;

                default:
                    return res.status(400).json({ error: 'Invalid status' });
            }

            return res.status(200).json({ message: 'Student status updated successfully' });
        } catch (error) {
            console.error('Error updating student status:', error);
            return res.status(500).json({ error: 'Failed to update student status' });
        }
    } else {
        res.status(405).json({ error: `${method} method unsupported` });
    }
};

export default handler;