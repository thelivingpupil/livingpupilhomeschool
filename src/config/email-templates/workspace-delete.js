// emailTemplates.ts
const html = ({ workspaceName, workspaceId }) => {
  return `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
    <title>Workspace Deleted</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--[if mso]>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
                <o:AllowPNG/>
            </o:OfficeDocumentSettings>
        </xml>
    <![endif]-->
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        a[x-apple-data-detectors] { color: inherit !important; text-decoration: inherit !important; }
        #MessageViewBody a { color: inherit; text-decoration: none; }
        p { line-height: inherit; }
        @media (max-width:620px) {
            .row-content { width: 100% !important; }
            .stack .column { width: 100%; display: block; }
        }
    </style>
</head>

<body style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff;">
        <tbody>
            <tr>
                <td>
                    <!-- Header -->
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                        <tbody>
                            <tr>
                                <td>
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:600px; margin:0 auto;">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top:15px; text-align:center;">
                                                    <img src="https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/232djymu/j2f/9gl/o0w/Email%20Header%202.png" 
                                                        style="display:block; width:100%; height:auto; border:0;" width="600" height="auto">
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Alert Content -->
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                        <tbody>
                            <tr>
                                <td>
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:600px; margin:0 auto; background-color:#ffffff; color:##000000;">
                                        <tbody>
                                            <tr>
                                                <td style="padding:35px; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:1.5;">
                                                    <p style="margin:0 0 10px 0;">Hello Admin,</p>
                                                    <p style="margin:0 0 10px 0;">This is an important notification from the system.</p>
                                                    <p style="margin:0 0 10px 0;">The following workspace has been <strong>deleted</strong>:</p>
                                                    <ul style="margin:10px 0; padding-left:20px;">
                                                        <li><strong>Workspace ID:</strong> ${workspaceId}</li>
                                                        <li><strong>Workspace Name:</strong> ${workspaceName}</li>
                                                    </ul>
                                        
                                                    <p style="margin:0;">Thank you!</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </td>
            </tr>
        </tbody>
    </table>
</body>

</html>
`;
};

const text = ({ workspaceName, workspaceId }) => {
  return `
Hello Admin,

The workspace "${workspaceName}" (ID: ${workspaceId}) has been deleted.
All related student records and school fees have also been marked as deleted.

If this was unintended, please review your system logs for further details.
`;
};

export { html, text };
