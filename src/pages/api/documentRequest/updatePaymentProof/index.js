import prisma from '@/prisma/index';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'POST') {
        try {
            const { transactionId, paymentProofUrl, captchaToken } = req.body;

            // Validate required fields
            if (!transactionId || !paymentProofUrl) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction ID and payment proof URL are required.',
                });
            }

            // Validate captcha
            if (!captchaToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Captcha verification is required.',
                });
            }

            // Verify captcha token (you'll need to implement this based on your captcha service)
            // For now, we'll do a basic check - you can integrate with reCAPTCHA or similar
            try {
                // Example: Verify with reCAPTCHA
                const captchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
                });

                const captchaResult = await captchaResponse.json();

                if (!captchaResult.success) {
                    return res.status(400).json({
                        success: false,
                        message: 'Captcha verification failed. Please try again.',
                    });
                }
            } catch (captchaError) {
                console.error('Captcha verification error:', captchaError);
                return res.status(400).json({
                    success: false,
                    message: 'Captcha verification failed. Please try again.',
                });
            }

            if (!transactionId || !paymentProofUrl) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction ID and payment proof URL are required.',
                });
            }

            // Update the transaction with payment proof
            const updatedTransaction = await prisma.transaction.update({
                where: {
                    transactionId: transactionId,
                },
                data: {
                    paymentProofLink: paymentProofUrl,
                    // Keep paymentStatus as is (should remain P for Pending)
                    // Status will be changed to S (Success) when admin verifies the payment
                    updatedAt: new Date(),
                },
            });

            res.status(200).json({
                success: true,
                message: 'Payment proof uploaded successfully.',
                data: {
                    transaction: updatedTransaction,
                },
            });
        } catch (error) {
            console.error('Error updating payment proof:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update payment proof.',
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
};

export default handler; 