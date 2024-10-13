import nodemailer from 'nodemailer';

// Function to get email credentials for each sender
export const getSenderCredentials = (sender) => {
    let senderName, email, appPassword;

    switch (sender) {
        case 'admin':
            senderName = "LP Admin";
            email = process.env.ADMIN_EMAIL;
            appPassword = process.env.ADMIN_APP_PASSWORD;
            break;
        case 'finance':
            senderName = "LP Finance";
            email = process.env.FINANCE_EMAIL;
            appPassword = process.env.FINANCE_APP_PASSWORD;
            break;
        case 'shop':
            senderName = "LP Shop";
            email = process.env.SHOP_EMAIL;
            appPassword = process.env.SHOP_APP_PASSWORD;
            break;
        case 'coo':
            senderName = "LP COO";
            email = process.env.COO_EMAIL;
            appPassword = process.env.COO_APP_PASSWORD;
            break;
        case 'directress':
            senderName = "LP Directress";
            email = process.env.DIRECTRESS_EMAIL;
            appPassword = process.env.DIRECTRESS_APP_PASSWORD;
            break;
        case 'cottage':
            senderName = "LP Cottage Coordinator";
            email = process.env.COTTAGE_EMAIL;
            appPassword = process.env.COTTAGE_APP_PASSWORD;
            break;
        default:
            throw new Error(`Unknown sender: ${sender}`);
    }

    return { senderName, email, appPassword };
};

// Function to get sender details
export const getSenderDetails = (sender) => {
    let senderRole, senderFullName;

    switch (sender) {
        case 'admin':
            senderRole = "Admin Officer"
            senderFullName = "Ameline Baran"
            break;
        case 'finance':
            senderRole = "Finance Officer"
            senderFullName = "Karen Yap"
            break;
        case 'shop':
            senderRole = "Admin Assistant"
            senderFullName = "Mynelyn Namacpacan"
            break;
        case 'coo':
            senderRole = "Chief Operations Officer"
            senderFullName = "Arjeli Ricarte"
            break;
        case 'directress':
            senderRole = "Directress"
            senderFullName = "Azenith Jacalan"
            break;
        case 'cottage':
            senderRole = "Homeschool Cottage Coordinator"
            senderFullName = "Joshua Jacalan"
            break;
        default:
            throw new Error(`Unknown sender: ${sender}`);
    }

    return { senderRole, senderFullName };
};

// Function to send email using Gmail with an App Password
export const sendMailWithGmail = async ({ sender, to, subject, text, html }) => {
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
