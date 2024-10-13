const html = ({
	parentName,
	orderCode,
	reciever,
	deliveryAddress,
	contactNumber
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

		table.details-table {
            width: 70%;
			margin-bottom: 20px;
            }

        table.details-table td {
            width: 50%;
            padding: 5px;
            text-align: left;
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
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; background-color: #fff; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="35" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#000000;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:14.399999999999999px;">
																	<p style="margin: 0; margin-bottom: 3px;">Dear ${parentName},</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 3px;">
																		I hope this message finds you well.
																	</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 3px;">
																		We are writing to confirm receipt of your order from the LP Shop. We will begin processing your shipment within the next 3-4 business days. To ensure a smooth delivery process, please review and confirm the details provided below:
																	</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<table class="details-table" style="border-collapse: collapse;">
                                                                        <tr>
                                                                            <td style="padding: 5px; text-align: left;">Order Code:</td>
                                                                            <td style="padding: 5px; text-align: left;">${orderCode}</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td style="padding: 5px; text-align: left;">Reciever:</td>
                                                                            <td style="padding: 5px; text-align: left;">${reciever}</td>
                                                                        </tr>
																		<tr>
                                                                            <td style="padding: 5px; text-align: left;">Delivery Address:</td>
                                                                            <td style="padding: 5px; text-align: left;">${deliveryAddress}</td>
                                                                        </tr>
																		<tr>
                                                                            <td style="padding: 5px; text-align: left;">Contact Number:</td>
                                                                            <td style="padding: 5px; text-align: left;">${contactNumber}</td>
                                                                        </tr>
                                                                    </table>
																	<p style="margin: 0; margin-bottom: 3px;">
																		<strong>Delivery Partner:</strong> For orders outside Cebu City, our delivery partner is LBC. For deliveries within Cebu City, you may choose between Maxim, Lalamove, or our LP rider.
																	</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0;">
																		<strong>Important Note for Cebu Orders:</strong> For addresses outside Cebu City or Mandaue City, any additional charges for Maxim or Lalamove will be your responsibility. We will notify you via text if there are any extra fees.
																	</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0;">
																		<strong>Payment Policy: </strong>Please note that only paid orders will be processed. If payment is not completed within 24 hours, your order will be automatically canceled.
																	</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0;">
																		<strong>Installment Payment Option:</strong> If you prefer to pay in installments, we offer a payment plan payable over 5 months with a 2% interest rate per month. Please send a message to <a href="mailto:finance.livingpupil@gmail.com" target="_blank">finance.livingpupil@gmail.com</a> to avail of the said offer.
																	</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0; color: red;">
																		Please confirm the accuracy of the order details and indicate your preferred delivery partner by replying to this email
																		no later than 12:00 PM tomorrow. If you have any questions or need further assistance, you can also reach us at 09212375729.
																	</p>
																	<p style="margin: 0; margin-bottom: 3px;">&nbsp;</p>
																	<p style="margin: 0;">Thank you for your order and continued support. We appreciate your trust in us and look forward to serving you.</p>
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0;">Cheers!</p>
                                                                    <p style="margin: 0;">Living Pupil Team</p>
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

const text = ({ parentName, firstName }) => {
	return `
Hello ${parentName},

We have received ${firstName}'s complete Enrollment Form.

Please give us some time to verify your information.

We will contact you soon!

Thank you!

Cheers,
${process.env.EMAIL_FROM}
`;
};

export { html, text };
