import { sendMailWithGmail, getSenderDetails } from '@/lib/server/gmail';
import { html as announcementHtml, text as announcementText } from '@/config/email-templates/broadcast/announcement';
import { getParentFirstName } from '@/utils/index';

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'POST') {
        const { emailContent, sender, subject, guardianEmails } = req.body;

        // Define a function to validate email addresses
        const isValidEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        const { senderRole, senderFullName } = getSenderDetails(sender);

        // Function to send email with retry logic
        const sendEmailWithRetry = async (guardianEmail, attempts = 3) => {
            if (!isValidEmail(guardianEmail.email)) {
                console.log(`Skipping invalid email: ${guardianEmail.email}`);
                return;
            }

            const parentName = getParentFirstName(guardianEmail.primaryGuardianName);
            const emailOptions = {
                sender,
                to: guardianEmail.email,
                subject,
                text: announcementText({ parentName }),
                html: announcementHtml({ parentName, emailContent, senderRole, senderFullName }),
            };

            for (let attempt = 1; attempt <= attempts; attempt++) {
                try {
                    await sendMailWithGmail(emailOptions);
                    return;
                } catch (error) {
                    console.error(`Attempt ${attempt} failed for ${guardianEmail.email}:`, error);
                    if (attempt === attempts) throw error;
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
                }
            }
        };

        try {
            await Promise.all(guardianEmails.map(guardianEmail => sendEmailWithRetry(guardianEmail)));
            return res.status(200).json({ message: 'Emails sent successfully.' });
        } catch (error) {
            console.error('Failed to send emails:', error);
            return res.status(500).json({ error: 'Failed to send emails' });
        }
    } else {
        res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
    }
}