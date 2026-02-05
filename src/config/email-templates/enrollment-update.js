import {
	ACCREDITATION,
	ENROLLMENT_TYPE,
	GRADE_LEVEL,
	PAYMENT_METHOD,
	PAYMENT_TYPE,
	PROGRAM,
} from '@/utils/constants';

const html = ({
	accreditation,
	birthCertificateLink,
	enrollmentType,
	firstName,
	incomingGradeLevel,
	payment,
	paymentMethod,
	pictureLink,
	program,
	reportCardLink,
	url,
	primaryGuardianName,
}) => {
	return `
    <!DOCTYPE html>
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
		}
	</style>
</head>

<body class="body" style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f0f0f0;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-top: 15px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div style="max-width: 600px;"><img src="https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/232djymu/j2f/9gl/o0w/Email%20Header%202.png" style="display: block; height: auto; border: 0; width: 100%;" width="600" height="auto"></div>
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
					<table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f0f0f0;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; background-color: #2e3494; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div style="max-width: 600px;"><img src="https://a0ac0ddc75.imgdist.com/pub/bfra/232djymu/sz0/8ei/7y3/1.png" style="display: block; height: auto; border: 0; width: 100%;" width="600" height="auto"></div>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="35" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:14.399999999999999px;">
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Hi ${primaryGuardianName},</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Thank you for choosing Living Pupil Homeschool.</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">We are glad to inform you that we have received <strong>${firstName}'s</strong> records and will be processed for enrollment.</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">For confirmation, below are the details you have submitted.</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Enrollment Details</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Incoming Grade Level: ${GRADE_LEVEL[incomingGradeLevel]}</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Enrollment Type: ${ENROLLMENT_TYPE[enrollmentType]}</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Program: ${PROGRAM[program]}</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Accreditation: ${ACCREDITATION[accreditation]}</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Submitted Documents</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">ID Picture: ${pictureLink ? '<li>Picture</li>' : ''}</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Birth Certificate: ${birthCertificateLink ? '* Birth Certificate\n' : ''}</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Report Card / School Card: ${reportCardLink ? '* Report Card' : ''}</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Payment Details</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Payment Method: ${PAYMENT_METHOD[paymentMethod]}</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">Payment Type: ${payment === 'MONTHLY' ? 'Monthly Term Payment' : PAYMENT_TYPE[payment]}</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 3px; color:#ffffff;">In case you need any assistance and found any discrepancies, just hit reply.</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; color:#ffffff;">Thank you and have a wonderful day.</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="image_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div style="max-width: 600px;"><img src="https://a0ac0ddc75.imgdist.com/pub/bfra/232djymu/qiw/7ap/myx/2.png" style="display: block; height: auto; border: 0; width: 100%;" width="600" height="auto"></div>
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
					<table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f0f0f0;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 15px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div style="max-width: 600px;"><img src="https://a0ac0ddc75.imgdist.com/pub/bfra/232djymu/htb/fwc/2a6/Untitled%20design.png" style="display: block; height: auto; border: 0; width: 100%;" width="600" height="auto"></div>
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
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>

</html>
`;
};

const text = ({
	accreditation,
	birthCertificateLink,
	enrollmentType,
	firstName,
	incomingGradeLevel,
	payment,
	paymentMethod,
	pictureLink,
	program,
	reportCardLink,
	url,
}) => {
	return `
Thank you for choosing Living Pupil Homeschool.
We are glad to inform you that we have updated <strong>${firstName}'s</strong> records and school fees.

For confirmation, below are the details updated upon your request.

Enrollment Details
1. Incoming Grade Level: ${GRADE_LEVEL[incomingGradeLevel]}
2. Enrollment Type: ${ENROLLMENT_TYPE[enrollmentType]}
3. Program: ${PROGRAM[program]}
4. Accreditation: ${ACCREDITATION[accreditation]}

Submitted Documents
${pictureLink ? '* Picture\n' : ''}
${birthCertificateLink ? '* Birth Certificate\n' : ''}
${reportCardLink ? '* Report Card' : ''}

Payment Details
1. Payment Method: ${PAYMENT_METHOD[paymentMethod]}
2. Payment Type: ${PAYMENT_TYPE[payment]}

In case you need any assistance and found any discrepancies, just hit reply.

Cheers,
${process.env.EMAIL_FROM}
`;
};

export { html, text };
