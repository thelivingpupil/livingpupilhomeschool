import { DOCUMENT_DETAILS } from '@/utils/constants';

const html = ({
    requestorFullName,
    studentFullName,
    document,
    trackingCode,
}) => {
    return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!--><!--<![endif]-->
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
        }

        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
        }

        p {
            line-height: inherit
        }

        table.details-table {
            width: 70%;
            }
        
        table.details-table td {
            width: 50%;
            padding: 5px;
            text-align: left;
            }

        .social-icons {
            text-align: center;
            margin-top: 4px
        }
        .social-icons a {
            margin: 0 30px;
            text-decoration: none;
            display: inline-block;
            background-color: #71797E;
            border-radius: 50%;
            padding: 5px;
            border: 2px solid #71797E;
        }
        .social-icons img {
            width: 25px;
            height: 25px;
            display: block;
        }

        hr {
        border: none;
        border-top: 1px solid #cccccc;
        }

        .desktop_hide,
        .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
        }

        .image_block img+div {
            display: none;
        }

        @media (max-width:620px) {
            .mobile_hide {
                display: none;
            }

            .row-content {
                width: 100% !important;
            }

            .stack .column {
                width: 100%;
                display: block;
            }

            .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
            }

            .desktop_hide,
            .desktop_hide table {
                display: table !important;
                max-height: none !important;
            }

            .row-2 .column-1 .block-1.spacer_block,
            .row-6 .column-1 .block-1.spacer_block {
                height: 30px !important;
            }

            .row-4 .column-1 .block-1.paragraph_block td.pad>div {
                font-size: 12px !important;
            }

            .row-7 .column-1 {
                padding: 0 !important;
            }

            .details-table {
            width: 70% !important;
            }
        }
    </style>
</head>

<body class="body" style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
        <tbody>
            <tr>
                <td>
                    <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #e2edf7; ">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 600px; margin: 0 auto; margin-top: 20px;" width="600">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad" style="width:100%;">
                                                                <div class="alignment" align="center" style="line-height:10px">
                                                                    <div style="max-width: 600px;"><img src="https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/ru4tyq42/3np/jxg/2qr/Email%20Header%202.png" style="display: block; height: auto; border: 0; width: 100%;" width="600" height="auto"></div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #e2edf7;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; border-radius: 0; color: #000000; width: 600px; margin: 0 auto;" width="600">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1" style="height:60px;line-height:60px;font-size:1px;">&#8202;</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #e2edf7;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffff; border-radius: 0; color: #000000; width: 600px; margin: 0 auto;" width="600">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px; padding: 25px">
                                                    <table class="paragraph_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div style="color:#000;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:15px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                    <p style="margin: 0; margin-bottom: 16px;">Hello <strong style="color: #2e3494;">${requestorFullName}</strong>,</p>
                                                                    <p style="margin: 0; margin-bottom: 16px;">Good day!</p>
                                                                    <p style="margin: 0; margin-bottom: 16px;">We are pleased to inform you that the requested documents for <strong>${studentFullName}</strong> have been shipped via LBC. The documents include the following:</p>
                                                                    <ul>
        ${document.map(doc => {
        const detail = DOCUMENT_DETAILS[doc.docName];
        return `<li>${detail ? detail.label : `Unknown Document: ${doc.docName}`}</li>`;
    }).join('')}
    </ul>
                                                                    <p style="margin-top: 20px; margin-bottom: 16px;">Here are the shipping details for your reference:</p>
                                                                    <p style="margin-top: 20px; margin-bottom: 16px;">LBC Tracking Number: <strong>${trackingCode}</strong></p>
                                                                    <p style="margin-top: 20px; margin-bottom: 16px;">You may track the shipment's status using the tracking number on the https://www.lbcexpress.com/bn/track</p>
                                                                    <p style="margin: 0; margin-bottom: 16px;">Thank you for your trust in Living Pupil Homeschool. Should you have further inquiries, please feel free to contact us.</p>
                                                                    <p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
                                                                    <p style="margin: 0;">Best regards, </p>
                                                                    <p style="margin: 0;"><strong>Living Pupil Homeschool</strong></p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-6" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #e2edf7;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; border-radius: 0; color: #000000; width: 600px; margin: 0 auto;" width="600">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1" style="height:60px;line-height:60px;font-size:1px;">&#8202;</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #e2edf7; padding-bottom: 20px;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; border-radius: 0; color: #000000; width: 600px; margin: 0 auto;" width="600">
                                        <tr>
                                            <td>
                                                <div class="social-icons">
                                                    <a href="https://www.facebook.com/livingpupilhomeschool">
                                                        <img src="https://livingpupilhomeschool.com/images/email-img/facebook.png" alt="Facebook">
                                                    </a>
                                                    <a href="https://www.instagram.com/livingpupilhomeschool/">
                                                        <img src="https://livingpupilhomeschool.com/images/email-img/instagram.png" alt="LP Shop">
                                                    </a>
                                                    <a href="https://www.youtube.com/livingpupilhomeschool">
                                                        <img src="https://livingpupilhomeschool.com/images/email-img/youtube.png" alt="YouTube">
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div class="footer" style="text-align: center; color: #666; margin-bottom: 40px;">
                                                    <p style="font-size: 16px;"><a href="https://livingpupilhomeschool.com" style="text-decoration:none;color:#2e3494" target="_blank">www.livingpupilhomeschool.com</a></p>
                                                    <p style="font-size: 12px;">
                                                        Living Pupil Homeschool, Lot 49, Sector 6, Greenview Subdivision Pagsabungan, Mandaue City, Cebu 6014 <br>
                                                        (032) 252 7568 • (+63) 917 1199 351 • <a href="mailto:info@livingpupilhomeschool.com">info@livingpupilhomeschool.com</a>

                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table><!-- End -->
</body>

</html>`;
};

const text = ({ email }) => {
    return `
Welcome! You are logging in with ${email}

If you did not request this email you can safely ignore it.

In case you need any assistance, just hit reply.

Cheers,
${process.env.EMAIL_FROM}
`;
};

export { html, text };
