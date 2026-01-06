const html = ({
	parentName,
	emailContent,
	senderRole,
	senderFullName
}) => {
	return `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
	<title></title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!--><!--<![endif]-->
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
            font-family: 'Poppins', sans-serif;
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

        .social-icons {
            text-align: center;
            margin-top: 40px
        }
        .social-icons a {
            margin: 0 30px;
            text-decoration: none;
            display: inline-block;
            background-color: #2e3494;
            border-radius: 25%;
            padding: 5px;
            border: 2px solid #2e3494;
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

        h2 {
        font-size: 1.5rem; /* Base size */
        font-weight: 600;
        }

        /* Style images in email content - no padding or margin */
        img {
            max-width: 100% !important;
            height: auto !important;
            display: block;
            margin: 0 !important;
            padding: 0 !important;
        }

        /* Ensure images from ReactQuill display properly - no padding or margin */
        .ql-editor img,
        .ql-align-center img {
            display: block;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100%;
            height: auto;
        }

        .ql-align-left img {
            display: inline-block;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100%;
            height: auto;
        }

        .ql-align-right img {
            display: inline-block;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100%;
            height: auto;
        }

        /* Support indentation in emails - ReactQuill uses ql-indent classes */
        .ql-indent-1 {
            padding-left: 3em !important;
        }

        .ql-indent-2 {
            padding-left: 6em !important;
        }

        .ql-indent-3 {
            padding-left: 9em !important;
        }

        .ql-indent-4 {
            padding-left: 12em !important;
        }

        .ql-indent-5 {
            padding-left: 15em !important;
        }

        .ql-indent-6 {
            padding-left: 18em !important;
        }

        .ql-indent-7 {
            padding-left: 21em !important;
        }

        .ql-indent-8 {
            padding-left: 24em !important;
        }

        /* Support indentation using inline styles (for email compatibility) */
        [style*="padding-left"] {
            /* Preserve inline padding-left styles for indentation */
        }

        /* Support for list indentation */
        ol.ql-indent-1,
        ul.ql-indent-1 {
            padding-left: 3em !important;
        }

        ol.ql-indent-2,
        ul.ql-indent-2 {
            padding-left: 6em !important;
        }

        ol.ql-indent-3,
        ul.ql-indent-3 {
            padding-left: 9em !important;
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

            h2 {
                font-size: 1.5rem;  /* Adjust for smaller screens */
            }
		}

        @media (max-width: 500px) {
            h2 {
                font-size: 1.2rem; /* Even smaller screens */
            }
        }

        @media (max-width: 400px) {
            h2 {
                font-size: 1rem; /* Even smaller screens */
            }
        }
	</style>
</head>

<body class="body" style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #e2edf7;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div style="max-width: 600px;"><img src="https://livingpupilhomeschool.com/images/email-img/lp-email-header.jpg" style="display: block; height: auto; border: 0; width: 100%;" width="600" height="auto"></div>
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
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffff; border-radius: 0; color: #000000; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding:0;">
																<div class="email-content" style="color:#000;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:15px;font-weight:400;letter-spacing:0px;line-height: 20px;text-align:left;mso-line-height-alt:19.2px;margin:0;">
                                                                    <p style="margin: 0; margin-bottom: 16px;padding:25px;">Hello <strong style="color: #2e3494;">${parentName}</strong>,</p>
                                                                    <div style="margin:0;padding:0;">${emailContent}</div>
																	<div class="senderDetails" style="text-align: center; display: inline-block; padding: 25px">
																		<p style="margin: 0; font-weight: bold; text-decoration: underline;">${senderFullName}</p>
    																	<p style="margin: 0;">${senderRole}</p>
																	</div>
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

</html>
`;
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
