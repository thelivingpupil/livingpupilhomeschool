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

        // Function to delay execution for a specified number of milliseconds
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Send email to each guardian, but skip if email is invalid
        const promises = guardianEmails.map(async (guardianEmail) => {
            if (!isValidEmail(guardianEmail.email)) {
                console.log(`Skipping invalid email: ${guardianEmail.email}`);
                return; // Skip this email
            }

            const parentName = getParentFirstName(guardianEmail.primaryGuardianName);
            try {
                await sendMailWithGmail({
                    sender, // Dynamically select the account based on sender
                    to: guardianEmail.email,
                    subject,
                    text: announcementText({ parentName }), // Generate text content from the template
                    html: announcementHtml({ parentName, emailContent, senderRole, senderFullName }), // Generate HTML content from the template
                });

                // Wait for 5 seconds before sending the next email
                await delay(2000);
            } catch (error) {
                console.error(`Failed to send email to ${guardianEmail.email}:`, error);
            }
        });

        try {
            await Promise.all(promises);
            return res.status(200).json({ message: 'Emails sent successfully.' });
        } catch (error) {
            console.error('Failed to send emails:', error);
            return res.status(500).json({ error: { msg: 'Failed to send emails.' } });
        }
    } else {
        res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
    }
}