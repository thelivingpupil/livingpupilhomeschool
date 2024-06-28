import {
	ACCREDITATION,
	GRADE_LEVEL,
	PROGRAM,
	GRADE_TO_FORM_MAP,
} from '@/utils/constants';
import useState from 'react';
const html = ({
	primaryGuardianName,
	firstName,
	middleName,
	lastName,
	incomingGradeLevel,
	program,
	accreditation,
	enrollmentType,
	cottageType
}) => {
	const baseUrl = "livingpupilhomeschool.com";
	const grade = GRADE_TO_FORM_MAP[incomingGradeLevel]
	const url = program === 'HOMESCHOOL_COTTAGE'
		? `${baseUrl}/homeschool-cottage?enrollmentType=${enrollmentType}&cottageType=${cottageType}&incomingGradeLevel=${grade}`
		: `${baseUrl}/homeschool-program?enrollmentType=${enrollmentType}&incomingGradeLevel=${incomingGradeLevel}`;

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
			.desktop_hide table.icons-inner {
				display: inline-block !important;
			}

			.icons-inner {
				text-align: center;
			}

			.icons-inner td {
				margin: 0 auto;
			}

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
			.row-2 .column-1 .block-7.spacer_block,
			.row-3 .column-1 .block-1.spacer_block,
			.row-3 .column-1 .block-3.spacer_block,
			.row-3 .column-1 .block-5.spacer_block,
			.row-4 .column-2 .block-1.spacer_block,
			.row-4 .column-2 .block-5.spacer_block {
				height: 20px !important;
			}

			.row-2 .column-1 .block-2.paragraph_block td.pad>div,
			.row-2 .column-1 .block-4.paragraph_block td.pad>div,
			.row-2 .column-1 .block-6.paragraph_block td.pad>div,
			.row-3 .column-1 .block-4.paragraph_block td.pad>div,
			.row-3 .column-1 .block-6.paragraph_block td.pad>div {
				font-size: 12px !important;
			}

			.row-4 .column-2 .block-2.icons_block .pad,
			.row-4 .column-2 .block-3.icons_block .pad,
			.row-4 .column-2 .block-4.icons_block .pad {
				text-align: left !important;
			}

			.row-4 .column-2 {
				padding: 5px 0 5px 20px !important;
			}

			.row-5 .column-1 {
				padding: 0 !important;
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
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<div class="spacer_block block-1 mobile_hide" style="height:16px;line-height:16px;font-size:1px;">&#8202;</div>
													<table class="image_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div style="max-width: 600px;"><img src="https://807b78d2be.imgdist.com/pub/bfra/ru4tyq42/yku/7bu/osz/LOA%20Header%201.png" style="display: block; height: auto; border: 0; width: 100%;" width="600" height="auto"></div>
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
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; background-image: url('https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/ru4tyq42/wd3/xcb/0aj/transparentBG.png'); background-position: top center; background-repeat: no-repeat; background-size: auto; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<div class="spacer_block block-1" style="height:60px;line-height:60px;font-size:1px;">&#8202;</div>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#2e3494;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:700;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0;">June 19, 2024</p>
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-3" style="height:60px;line-height:60px;font-size:1px;">&#8202;</div>
													<table class="paragraph_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#2e3494;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; margin-bottom: 16px;">Dear ${primaryGuardianName},</p>
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 16px;">On behalf of Living Pupil Homeschool, I am pleased to congratulate you on the acceptance of your student, <strong><em>${firstName} ${middleName} ${lastName}</em></strong>, into our homeschool program for SY 2024-2025.</p>
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 16px;">Through your submitted documents, we have confirmed that your child is an ideal candidate as incoming <strong><em>${GRADE_LEVEL[incomingGradeLevel]}</em></strong> student.</p>
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 16px;">We have enclosed the inclusions you will receive as part of the LP family on the second page and the contact details of our support team. Feel free to contact us anytime, as we desire to make your transition as easy as possible.</p>
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 16px;">Again, welcome to Living Pupil Homeschool!</p>
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0;">Together with you on this beautiful journey,</p>
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-5" style="height:60px;line-height:60px;font-size:1px;">&#8202;</div>
													<table class="paragraph_block block-6" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#2e3494;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; margin-bottom: 4px;"><strong>Azenith N. Jacalan </strong></p>
																	<p style="margin: 0;">Living Pupil Homeschool Directress</p>
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-7" style="height:65px;line-height:65px;font-size:1px;">&#8202;</div>
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
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; border-radius: 0; color: #000000; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<div class="spacer_block block-1" style="height:60px;line-height:60px;font-size:1px;">&#8202;</div>
													<table class="image_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div style="max-width: 600px;"><img src="https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/ru4tyq42/if0/hu7/mmt/LOA%20Header%202.png" style="display: block; height: auto; border: 0; width: 100%;" width="600" height="auto"></div>
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-3" style="height:60px;line-height:60px;font-size:1px;">&#8202;</div>
													<table class="paragraph_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#2e3494;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:700;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; margin-bottom: 10px;">Program: ${PROGRAM[program]}</p>
																	<p style="margin: 0; margin-bottom: 10px;">Grade Level: ${GRADE_LEVEL[incomingGradeLevel]}</p>
																	<p style="margin: 0;">Accreditation: ${ACCREDITATION[accreditation]}&nbsp;</p>
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-5" style="height:35px;line-height:35px;font-size:1px;">&#8202;</div>
													<table class="paragraph_block block-6" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#2e3494;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:700;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; margin-bottom: 16px;">Program Inclusion:</p>
																	<p style="margin: 0;"><a href="${url}" target="_blank" style="text-decoration: underline; color: #7747FF;" rel="noopener">Click this link to see the full program details</a></p>
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-7" style="height:60px;line-height:60px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f0f0f0;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; border-radius: 0; color: #000000; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div style="max-width: 200px;"><img src="https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/ru4tyq42/wvy/0zo/dfo/livingpupil-homeschool-logo.png" style="display: block; height: auto; border: 0; width: 100%;" width="200" height="auto"></div>
																</div>
															</td>
														</tr>
													</table>
												</td>
												<td class="column column-2" width="66.66666666666667%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-left: 60px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<div class="spacer_block block-1" style="height:45px;line-height:45px;font-size:1px;">&#8202;</div>
													<table class="icons_block block-2" width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; text-align: left;">
														<tr>
															<td class="pad" style="vertical-align: middle;">
																<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																	<tr>
																		<td class="alignment" style="vertical-align: middle; text-align: left;"><!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
																			<!--[if !vml]><!-->
																			<table class="icons-inner" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; margin-right: -4px; padding-left: 0px; padding-right: 0px;" cellpadding="0" cellspacing="0" role="presentation"><!--<![endif]-->
																				<tr>
																					<td style="vertical-align: middle; text-align: center; padding-top: 5px; padding-bottom: 5px; padding-left: 5px; padding-right: 10px;"><a href="tel:0324152118" target="_self" style="text-decoration: none;"><img class="icon" src="https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/ru4tyq42/ud5/p95/h3a/telephone.png" height="auto" width="16" align="center" style="display: block; height: auto; margin: 0 auto; border: 0;"></a></td>
																					<td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 400; color: #2e3494; vertical-align: middle; letter-spacing: undefined; text-align: left;"><a href="tel:0324152118" target="_self" style="color: #2e3494; text-decoration: none;"> 032 415 2118</a></td>
																				</tr>
																			</table>
																		</td>
																	</tr>
																</table>
															</td>
														</tr>
													</table>
													<table class="icons_block block-3" width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; text-align: left;">
														<tr>
															<td class="pad" style="vertical-align: middle;">
																<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																	<tr>
																		<td class="alignment" style="vertical-align: middle; text-align: left;"><!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
																			<!--[if !vml]><!-->
																			<table class="icons-inner" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; margin-right: -4px; padding-left: 0px; padding-right: 0px;" cellpadding="0" cellspacing="0" role="presentation"><!--<![endif]-->
																				<tr>
																					<td style="vertical-align: middle; text-align: center; padding-top: 5px; padding-bottom: 5px; padding-left: 5px; padding-right: 10px;"><a href="gmail.com" target="_blank" style="text-decoration: none;"><img class="icon" src="https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/ru4tyq42/gw5/8x3/wl6/email.png" height="auto" width="16" align="center" style="display: block; height: auto; margin: 0 auto; border: 0;"></a></td>
																					<td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 400; color: #2e3494; vertical-align: middle; letter-spacing: undefined; text-align: left;"><a href="gmail.com" target="_blank" style="color: #2e3494; text-decoration: none;">info@livingpupil@gmail.com</a></td>
																				</tr>
																			</table>
																		</td>
																	</tr>
																</table>
															</td>
														</tr>
													</table>
													<table class="icons_block block-4" width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; text-align: left;">
														<tr>
															<td class="pad" style="vertical-align: middle;">
																<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																	<tr>
																		<td class="alignment" style="vertical-align: middle; text-align: left;"><!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
																			<!--[if !vml]><!-->
																			<table class="icons-inner" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; margin-right: -4px; padding-left: 0px; padding-right: 0px;" cellpadding="0" cellspacing="0" role="presentation"><!--<![endif]-->
																				<tr>
																					<td style="vertical-align: middle; text-align: center; padding-top: 5px; padding-bottom: 5px; padding-left: 5px; padding-right: 10px;"><a href="https://www.google.com/maps/place/Living+Pupil+Homeschool/@10.2739571,123.8532419,17z/data=!3m1!4b1!4m6!3m5!1s0x33a99d11e103df21:0x52abe59cb72322b4!8m2!3d10.2739518!4d123.8558168!16s%2Fg%2F11jq722c3g?entry=ttu" target="_blank" style="text-decoration: none;"><img class="icon" src="https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/ru4tyq42/efi/634/173/location.png" height="auto" width="16" align="center" style="display: block; height: auto; margin: 0 auto; border: 0;"></a></td>
																					<td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 400; color: #2e3494; vertical-align: middle; letter-spacing: undefined; text-align: left;"><a href="https://www.google.com/maps/place/Living+Pupil+Homeschool/@10.2739571,123.8532419,17z/data=!3m1!4b1!4m6!3m5!1s0x33a99d11e103df21:0x52abe59cb72322b4!8m2!3d10.2739518!4d123.8558168!16s%2Fg%2F11jq722c3g?entry=ttu" target="_blank" style="color: #2e3494; text-decoration: none;"> San Agustin Village, Tugas, Inayawan, Cebu</a></td>
																				</tr>
																			</table>
																		</td>
																	</tr>
																</table>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-5" style="height:45px;line-height:45px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f0f0f0;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; border-radius: 0; color: #000000; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div style="max-width: 600px;"><img src="https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/ru4tyq42/t0n/l86/xad/Email%20Footer%20%28794%20x%20150%20px%29.png" style="display: block; height: auto; border: 0; width: 100%;" width="600" height="auto"></div>
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
