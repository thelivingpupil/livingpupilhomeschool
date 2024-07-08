import { validateSession } from '@/config/api-validation';
import { getStudentRecords } from '@/prisma/services/student-record';
import { updateStudentStatus } from '@/prisma/services/student-record';
import { sendMail } from '@/lib/server/mail';
import { html, text } from '@/config/email-templates/initial-acceptance';
import {
    html as acceptanceHtml,
    text as acceptanceText,
} from '@/config/email-templates/letter-of-acceptance';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        await validateSession(req, res);
        const students = await getStudentRecords();
        res.status(200).json({ data: { students } });
    } else if (method === 'PUT') {
        try {
            const {
                studentId,
                firstName,
                middleName,
                lastName,
                accreditation,
                enrollmentType,
                incomingGradeLevel,
                program,
                email,
                studentStatus,
                primaryGuardianName,
                cottageType,
            } = req.body;
            if (!studentId) {
                return res.status(400).json({ error: 'Student ID is required' });
            }
            // update student records
            const newStudentStatus = await Promise.all([
                updateStudentStatus(studentId, studentStatus),
            ]);
            console.log(studentStatus)
            if (studentStatus === 'INITIALLY_ENROLLED') {
                await sendMail({
                    html: html({
                        primaryGuardianName,
                        firstName,
                        middleName,
                        lastName,
                        enrollmentType,
                        incomingGradeLevel
                    }),
                    subject: `[Living Pupil Homeschool] Initial Acceptance of ${firstName}`,
                    text: text({
                        primaryGuardianName,
                        firstName,
                    }),
                    to: [email],
                });
            }
            else if (studentStatus === 'ENROLLED') {
                await sendMail({
                    html: acceptanceHtml({
                        primaryGuardianName,
                        firstName,
                        middleName,
                        lastName,
                        incomingGradeLevel,
                        program,
                        accreditation,
                        enrollmentType,
                        cottageType
                    }),
                    subject: `[Living Pupil Homeschool] Letter of Acceptance for ${firstName}`,
                    text: acceptanceText({
                        primaryGuardianName,
                        firstName,
                    }),
                    to: [email],
                });
            }
            else {
                res.status(500).json({ error: 'Status invalid' });
            }

            res.status(200).json({ message: 'Student status updated successfully' });
        } catch (error) {
            console.error('Error updating student status:', error);
            res.status(500).json({ error: 'Failed to update student status' });
        }
    } else {
        res.status(405).json({ error: `${method} method unsupported` });
    }
};

export default handler;
