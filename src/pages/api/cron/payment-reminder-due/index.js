import { getStudentRecords } from "@/prisma/services/student-record";
import { sendMail } from '@/lib/server/mail';
import { html, text } from '@/config/email-templates/payment-reminder-due';
import { getDeadline } from "@/utils/index";
import { differenceInDays, parse } from 'date-fns';
import { renewTransaction } from "@/prisma/services/transaction";
import crypto from 'crypto';

export default async function handler(req, res) {
    try {
        const studentRecords = await getStudentRecords();

        // Mocking today's date as July 29th for testing
        const today = new Date();
        let emailCounter = 0; // Initialize the email counter

        for (const studentRecord of studentRecords) {
            // Find the school fee with order 0
            const feeOrder0 = studentRecord.student?.schoolFees.find(fee => fee.order === 0);

            if (feeOrder0 && feeOrder0.transaction) {
                const order0PaymentStatus = feeOrder0.transaction.paymentStatus;
                // Check if the paymentStatus is 'S'
                if (feeOrder0.transaction.paymentStatus !== 'S') {
                    console.warn(`Skipping student ${studentRecord.id} because the downpayment (order 0) is not marked as 'S'.`);
                    continue;
                }

                // Process each schoolFee and its transaction
                for (const fee of studentRecord.student?.schoolFees || []) {
                    const transaction = fee.transaction;

                    if (!transaction) {
                        console.warn(`Skipping fee ${fee.order} due to missing transaction.`);
                        continue;
                    }

                    if (fee.order === 0) {
                        console.warn(`Skipping fee ${fee.order}. Fee is downpayment.`);
                        continue;
                    }

                    if (fee.transaction.paymentStatus === 'S') {
                        console.warn(`Skipping fee ${fee.order}. Already paid.`);
                        continue;
                    }

                    const downpaymentDate = feeOrder0.transaction.updatedAt;
                    const schoolYear = studentRecord.schoolYear;
                    const studentFirstName = studentRecord.firstName;
                    const amount = transaction.amount.toFixed(2);

                    if (!schoolYear || !downpaymentDate || !studentFirstName) {
                        console.warn(`Skipping student record ${studentRecord.id} due to missing data.`);
                        continue;
                    }

                    // Get the deadline for the transaction
                    const deadlineStr = getDeadline(
                        fee.order,
                        fee.paymentType,
                        downpaymentDate,
                        schoolYear,
                        order0PaymentStatus
                    );

                    if (deadlineStr) {
                        const deadline = parse(deadlineStr, 'MMMM dd, yyyy', new Date());
                        const daysUntilDeadline = differenceInDays(deadline, today);

                        if (daysUntilDeadline === 0) {
                            const parentName = studentRecord.student?.creator?.guardianInformation?.primaryGuardianName?.split(' ')[0] || studentRecord.student?.creator?.email?.split(' ')[0];
                            const newTransactionId = crypto.randomUUID();
                            const newTransaction = await renewTransaction(
                                studentRecord.student?.creator?.email,
                                transaction.transactionId,
                                newTransactionId,
                                transaction.amount,
                                transaction.description,
                                transaction.source
                            );

                            const url = newTransaction?.url

                            await sendMail({
                                from: process.env.EMAIL_FROM,
                                html: html({
                                    parentName,
                                    studentFirstName,
                                    amount,
                                    url,
                                }),
                                subject: `[Living Pupil Homeschool] Payment Reminder Due Today`,
                                text: text({
                                    parentName,
                                    studentFirstName,
                                }),
                                to: [studentRecord.student?.creator?.email],
                            });

                            emailCounter++;
                            console.log(`Email sent to ${studentRecord.student?.creator?.email} for deadline ${deadlineStr}`);
                        }
                    }
                }
            } else {
                console.warn(`No school fee with order 0 found for student ${studentRecord.id}`);
            }
        }
        console.log(`Total emails sent: ${emailCounter}`);
        res.status(200).json({ message: 'Payment reminders sent if deadlines were within 7 days.' });
    } catch (error) {
        console.error('Error sending payment reminders:', error);
        res.status(500).json({ message: 'Failed to send payment reminders.' });
    }
}
