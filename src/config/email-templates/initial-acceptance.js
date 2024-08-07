const html = ({
	primaryGuardianName,
	firstName,
	middleName,
	lastName,
	enrollmentType,
	incomingGradeLevel
}) => {
	const isContinuingOrPreK = enrollmentType === 'CONTINUING' ||
		incomingGradeLevel === 'PRESCHOOL' ||
		incomingGradeLevel === 'K1' ||
		incomingGradeLevel === 'K2';
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

        ul {
            list-style-type: none; /* Remove default bullets */
            padding: 0; /* Remove default padding */
        }

        li {
            margin-bottom: 4px; /* Space between list items */
        }

        a {
            text-decoration: underline !important;
            color: #ffffff !important;
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
																<div style="color:#ffffff;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
																	<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">Dear Ms./Mr. <strong>${primaryGuardianName}</strong>,</p>
																	<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">It is with great pleasure that I share the news of your child, <strong><em>${firstName} ${middleName} ${lastName}'s</em></strong> initial acceptance into Living Pupil Homeschool for the academic year 2024-2025.</p>
																	<p style="margin: 0; margin-bottom: 4px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">To complete the admission process smoothly, please proceed with the following steps:</p>
																	<p style="margin: 0; margin-bottom: 4px;">&nbsp;</p>
																	<ul style="list-style-type: disc; color:#ffffff;">
																		<li style="margin: 0 0 10px 0;">
																			<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">School ID Form: <a href="https://forms.gle/SngPGpevT7cPNtrP6" style="text-decoration: underline; color: #ffffff;">https://forms.gle/SngPGpevT7cPNtrP6</a></p>
																		</li>
																		
																		${!isContinuingOrPreK ? `<li style="margin: 0 0 10px 0;">
																				<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">Report Card 
																					<em>(Please upload on the portal)</em>
																				</p>
																				<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">
																					<em>-an incomplete one is fine as long as it has the child's name, grade level, and the school's information</em>
																				</p> 
																			</li>`: ''}
																		<li style="margin: 0 0 10px 0;">
																			<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">Training Videos:</p>
																			<ul>
																				<li style="color:#ffffff; margin: 0 0 4px 0;" aria-level="1">&nbsp;Week 1: <a href="https://bit.ly/3RUjZ48">https://bit.ly/3RUjZ48</a></li>
																				<li style="color:#ffffff; margin: 0 0 4px 0;" aria-level="1">&nbsp;Week 2: <a href="https://bit.ly/3LgR7PI">https://bit.ly/3LgR7PI</a></li>
																				<li style="color:#ffffff; margin: 0 0 4px 0;" aria-level="1">&nbsp;Week 3: <a href="https://bit.ly/3RWfxBC">https://bit.ly/3RWfxBC</a></li>
																				<li style="color:#ffffff; margin: 0 0 4px 0;" aria-level="1">&nbsp;Week 4: <a href="https://bit.ly/462ZLLm">https://bit.ly/462ZLLm</a></li>
																				<li style="color:#ffffff; margin: 0 0 4px 0;" aria-level="1">&nbsp;Week 5: <a href="https://bit.ly/3VV6RwD">https://bit.ly/3VV6RwD</a></li>
																			</ul><p style="margin: 0; margin-bottom: 4px;">&nbsp;</p>
																		</li>
																	</ul>
																	<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">Upon successful completion of the above tasks, your child will be officially enrolled. Subsequently, we will send you a Letter of Acceptance.</p>
																	<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">We eagerly anticipate welcoming your child to our school community and are poised for an outstanding year ahead. Should you have any queries, please don't hesitate to contact us.</p>
																	<p style="margin: 0; margin-bottom: 4px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">Warm regards,</p>
																	<p style="margin: 0; margin-bottom: 4px; color:#ffffff;"><strong>Ameline C. Baran</strong></p>
																	<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">Admin Officer</p>
																	<p style="margin: 0; margin-bottom: 4px; color:#ffffff;">Living Pupil Homeschool</p>
																	<p style="margin: 0;">0945-647-6682</p>
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

</html>`;
};

const text = ({
	primaryGuardianName,
	firstName,
}) => {
	return `
Dear ${primaryGuardianName},

It is with great pleasure that I share the news of ${firstName}'s initial acceptance into Living Pupil Homeschool for the academic year 2024-2025:

Amanda Gaia U. Espiritu - Grade 10
Villamor U. Espiritu III - Grade 6
David Niño U. Jacalan - Grade 6

To complete the admission process smoothly, please proceed with the following steps:

1. School ID Form: https://forms.gle/SngPGpevT7cPNtrP6
2. Report Card (Please upload on the portal)
                  - an incomplete one is fine as long as it has the child's name, grade level, and the school's information
3. Training Videos:
 Week 1: https://docs.google.com/forms/d/e/1FAIpQLScchekkC2kZYOxjuBBpwPvBWZRSVnwAp5RK81VsI5MwYGHVHg/viewform
 Week 2: https://docs.google.com/forms/d/e/1FAIpQLSfErY89O_D6THqZyZ1aKo9shcrwXpb4B_fLz8vqWyAYZzoUZw/viewform
 Week 3: https://docs.google.com/forms/d/e/1FAIpQLSdFN8IJqcFEtrrJes07ZOKB7NvVgy8LpCl-bStden4C5I7v1A/viewform
 Week4 :https://docs.google.com/forms/d/e/1FAIpQLSdPhBOjqeF6YFymjfsUfZzfgEIm62uSTX3M1CK2EbOJkS12Hw/viewform

Upon successful completion of the above tasks, your children will be officially enrolled. Subsequently, we will send you a Letter of Acceptance.

We eagerly anticipate welcoming your children to our school community and are poised for an outstanding year ahead. Should you have any queries, please don't hesitate to contact us.

Warm regards,
Ameline C. Baran
Admin Officer
Living Pupil Homeschool
0945-647-6682
`;
};

export { html, text };
