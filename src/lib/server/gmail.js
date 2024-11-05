import nodemailer from 'nodemailer';
import { getSenderCredentials } from '@/utils/index';

// Function to send email using Gmail with an App Password
export const sendMailWithGmail = async ({ sender, to, subject, replyTo, text, html }) => {
    try {
        // Get sender email and app password
        const { senderName, email, appPassword } = getSenderCredentials(sender);

        // Create a Nodemailer transporter using the App Password
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: email,
                pass: appPassword, // Use the app password here
            },
        });

        // Define mail options, including the sender's name
        const mailOptions = {
            from: `${senderName} <${email}>`, // Set the sender's name and email
            to,
            replyTo,
            subject,
            text,
            html,
        };

        // Send the email
        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};
