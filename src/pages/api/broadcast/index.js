import { sendMailWithGmail } from '@/lib/server/gmail';
import { getSenderDetails, getSenderCredentials } from '@/utils/index';
import { html as announcementHtml, text as announcementText } from '@/config/email-templates/broadcast/announcement';
import { getParentFirstName } from '@/utils/index';
import { sendMail } from '@/lib/server/mail';
import { validateSession } from '@/config/api-validation';
import https from 'https';
import http from 'http';

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

            // Function to download image from URL and return buffer
            const downloadImage = (url) => {
                return new Promise((resolve, reject) => {
                    const protocol = url.startsWith('https') ? https : http;
                    protocol.get(url, (response) => {
                        if (response.statusCode !== 200) {
                            reject(new Error(`Failed to download image: ${response.statusCode}`));
                            return;
                        }
                        const chunks = [];
                        response.on('data', (chunk) => chunks.push(chunk));
                        response.on('end', () => resolve(Buffer.concat(chunks)));
                        response.on('error', reject);
                    }).on('error', reject);
                });
            };

            // Extract image URLs from emailContent and create cid attachments
            const extractImageUrls = (html) => {
                const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
                const imageUrls = [];
                let match;
                while ((match = imgRegex.exec(html)) !== null) {
                    const url = match[1];
                    // Only process Firebase Storage URLs (not data URIs or other sources)
                    if (url.startsWith('http') && !url.startsWith('data:')) {
                        imageUrls.push(url);
                    }
                }
                return [...new Set(imageUrls)]; // Remove duplicates
            };

            // Replace image URLs with cid references in HTML
            const replaceImagesWithCid = (html, imageMap) => {
                let processedHtml = html;
                Object.entries(imageMap).forEach(([url, cid]) => {
                    // Replace all occurrences of the image URL with cid
                    processedHtml = processedHtml.replace(
                        new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                        `cid:${cid}`
                    );
                });
                return processedHtml;
            };

            // Convert ReactQuill indentation classes to inline styles for email compatibility
            const convertIndentationToInlineStyles = (html) => {
                let processedHtml = html;
                // Map of indentation levels to padding values
                const indentMap = {
                    1: '3em',
                    2: '6em',
                    3: '9em',
                    4: '12em',
                    5: '15em',
                    6: '18em',
                    7: '21em',
                    8: '24em'
                };

                // Replace ql-indent classes with inline styles
                Object.entries(indentMap).forEach(([level, padding]) => {
                    // Match elements with ql-indent class
                    const regex = new RegExp(`<([^>]+)\\s+class="([^"]*\\s)?ql-indent-${level}(\\s[^"]*)?"([^>]*)>`, 'gi');
                    processedHtml = processedHtml.replace(regex, (match, tagName, beforeClass, afterClass, rest) => {
                        // Extract existing style if any
                        const styleMatch = match.match(/style="([^"]*)"/);
                        let existingStyle = styleMatch ? styleMatch[1] : '';

                        // Add padding-left if not already present
                        if (!existingStyle.includes('padding-left')) {
                            existingStyle = existingStyle
                                ? `${existingStyle}; padding-left: ${padding};`
                                : `padding-left: ${padding};`;
                        }

                        // Remove ql-indent class
                        const classParts = (beforeClass || '') + (afterClass || '');
                        const cleanedClass = classParts.replace(new RegExp(`\\s*ql-indent-${level}\\s*`, 'gi'), ' ').trim();

                        // Reconstruct the tag
                        const classAttr = cleanedClass ? `class="${cleanedClass}"` : '';
                        const styleAttr = existingStyle ? `style="${existingStyle}"` : '';
                        const attrs = [classAttr, styleAttr].filter(Boolean).join(' ');

                        return `<${tagName} ${attrs}${rest}>`;
                    });
                });

                return processedHtml;
            };

            // Process images: download and create attachments with cid
            const imageUrls = extractImageUrls(emailContent);
            const imageAttachments = [];
            const imageCidMap = {};

            for (let i = 0; i < imageUrls.length; i++) {
                const imageUrl = imageUrls[i];
                try {
                    const imageBuffer = await downloadImage(imageUrl);
                    const cid = `image_${i}_${Date.now()}`;
                    const filename = imageUrl.split('/').pop().split('?')[0] || `image_${i}.jpg`;

                    imageAttachments.push({
                        filename,
                        content: imageBuffer,
                        cid, // Content-ID for inline images
                    });

                    imageCidMap[imageUrl] = cid;
                } catch (error) {
                    console.error(`Failed to download image ${imageUrl}:`, error);
                    // Continue with other images even if one fails
                }
            }

            // Remove padding from paragraphs that contain images (for email client compatibility)
            // Since :has() selector isn't supported in all email clients, we add inline styles
            const removePaddingFromParagraphsWithImages = (html) => {
                return html.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (match, pAttrs, content) => {
                    // Check if paragraph contains images
                    if (!/<img[^>]*>/gi.test(content)) {
                        return match; // No images, keep as-is
                    }

                    // Paragraph contains images - add inline styles to remove padding
                    const styleMatch = pAttrs.match(/style="([^"]*)"/);
                    let existingStyle = styleMatch ? styleMatch[1] : '';

                    // Remove padding-left and padding-right if present, then add them as 0
                    existingStyle = existingStyle
                        .replace(/padding-left\s*:\s*[^;]+;?/gi, '')
                        .replace(/padding-right\s*:\s*[^;]+;?/gi, '')
                        .replace(/padding\s*:\s*[^;]+;?/gi, '')
                        .trim();

                    // Add padding-left and padding-right as 0
                    existingStyle = existingStyle
                        ? `${existingStyle}; padding-left: 0; padding-right: 0;`
                        : 'padding-left: 0; padding-right: 0;';

                    const styleAttr = `style="${existingStyle}"`;
                    const otherAttrs = pAttrs.replace(/style="[^"]*"/, '').trim();
                    const attrs = [styleAttr, otherAttrs].filter(Boolean).join(' ');

                    return `<p${attrs}>${content}</p>`;
                });
            };

            // Replace image URLs with cid in emailContent and convert indentation
            let processedEmailContent = replaceImagesWithCid(emailContent, imageCidMap);
            processedEmailContent = convertIndentationToInlineStyles(processedEmailContent);
            // Remove padding from paragraphs with images (for email client compatibility)
            processedEmailContent = removePaddingFromParagraphsWithImages(processedEmailContent);

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
            const fileAttachments = attachmentUrls?.length > 0
                ? attachmentUrls.map((url) => ({
                    filename: url.split('/').pop(), // Use the file name from the URL
                    path: url,                      // URL as the path to the file
                }))
                : [];

            // Combine image attachments (with cid) and file attachments
            const attachments = [...imageAttachments, ...fileAttachments];

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
                        html: announcementHtml({ parentName, emailContent: processedEmailContent, senderRole, senderFullName }),
                        subject,
                        text: announcementText({ parentName }),
                        to: guardianEmail.email,
                        attachments, // Attach images with cid and file attachments
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
                            html: announcementHtml({ parentName, emailContent: processedEmailContent, senderRole, senderFullName }),
                            subject,
                            text: announcementText({ parentName }),
                            to: guardianEmail.secondaryEmail,
                            attachments, // Attach images with cid and file attachments
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
