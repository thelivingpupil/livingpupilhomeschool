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

        const { senderRole, senderFullName } = getSenderDetails(sender)

        // Send email to each guardian, but skip if email is invalid
        const promises = guardianEmails.map(async (guardianEmail) => {
            if (!isValidEmail(guardianEmail.email)) {
                console.log(`Skipping invalid email: ${guardianEmail.email}`);
                return; // Skip this email
            }

            const parentName = getParentFirstName(guardianEmail.primaryGuardianName);
            return sendMailWithGmail({
                sender, // Dynamically select the account based on sender
                to: guardianEmail.email,
                subject,
                text: announcementText({ parentName }), // Generate text content from the template
                html: announcementHtml({ parentName, emailContent, senderRole, senderFullName }), // Generate HTML content from the template
            });
        });

        try {
            await Promise.all(promises);
            return res.status(200).json({ message: 'Emails sent successfully.' });
        } catch (error) {
            console.error('Failed to send emails:', error);
            return res.status(500).json({ error: 'Failed to send emails' });
        }
    } else {
        res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
    }
}
