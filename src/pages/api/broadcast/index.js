import { sendMailWithGmail } from '@/lib/server/gmail';
import { getSenderDetails, getSenderCredentials } from '@/utils/index';
import { html as announcementHtml, text as announcementText } from '@/config/email-templates/broadcast/announcement';
import { getParentFirstName } from '@/utils/index';
import { sendMail } from '@/lib/server/mail';
import { validateSession } from '@/config/api-validation';

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'POST') {
        try {
            // Authenticate and authorize - only ADMIN users can send broadcast emails
            const session = await validateSession(req, res);

            if (!session || session.user?.userType !== 'ADMIN') {
                return res.status(403).json({
                    errors: { error: { msg: 'Forbidden: Admin access required' } }
                });
            }

            const { emailContent, sender, subject, guardianEmails, ccEmails, attachmentUrls } = req.body;

            // Define a function to validate email addresses
            const isValidEmail = (email) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            };

            const { senderRole, senderFullName } = getSenderDetails(sender);
            const { senderName, email: replyEmail } = getSenderCredentials(sender);

            // Initialize email sent counter
            let emailCount = 0;

            // Create attachment objects from URLs only if attachmentUrls is not empty
            const attachments = attachmentUrls?.length > 0
                ? attachmentUrls.map((url) => ({
                    filename: url.split('/').pop(), // Use the file name from the URL
                    path: url,                      // URL as the path to the file
                }))
                : [];

            // Validate CC Emails
            const validCcEmails = (ccEmails || []).filter(isValidEmail);

            // Send email to each guardian, but skip if email is invalid
            const promises = guardianEmails.map(async (guardianEmail) => {
                if (!isValidEmail(guardianEmail.email)) {
                    return; // Skip this email
                }

                const parentName = getParentFirstName(guardianEmail.primaryGuardianName);
                try {
                    await sendMail({
                        from: `${senderName} <info@livingpupilhomeschool.com>`,
                        html: announcementHtml({ parentName, emailContent, senderRole, senderFullName }),
                        subject,
                        text: announcementText({ parentName }),
                        to: guardianEmail.email,
                        attachments, // Attach the Firebase Storage file URLs
                        replyTo: replyEmail,
                        cc: validCcEmails, // Include CC emails here
                    });

                    // Increment the counter for each successful email sent
                    emailCount++;

                    if (guardianEmail.secondaryEmail) {
                        if (!isValidEmail(guardianEmail.secondaryEmail)) {
                            return; // Skip this email
                        }

                        await sendMail({
                            from: `${senderName} <info@livingpupilhomeschool.com>`,
                            html: announcementHtml({ parentName, emailContent, senderRole, senderFullName }),
                            subject,
                            text: announcementText({ parentName }),
                            to: guardianEmail.secondaryEmail,
                            attachments, // Attach the Firebase Storage file URLs
                            replyTo: replyEmail,
                            cc: validCcEmails, // Include CC emails here
                        });

                        // Increment the counter for each successful email sent
                        emailCount++;
                    }
                } catch (error) {
                    console.error(`Failed to send email to ${guardianEmail.email}:`, error);
                }
            });

            try {
                await Promise.all(promises);
                return res.status(200).json({ message: `Emails sent successfully. Total emails sent: ${emailCount}` });
            } catch (error) {
                console.error('Failed to send emails:', error);
                return res.status(500).json({ error: { msg: 'Failed to send emails.' } });
            }
        } catch (error) {
            console.error('Broadcast API error:', error);
            // If error is already a response (from validateSession), it's already sent
            if (!res.headersSent) {
                return res.status(500).json({
                    errors: { error: { msg: 'Internal server error' } }
                });
            }
        }
    } else {
        res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
    }
}
