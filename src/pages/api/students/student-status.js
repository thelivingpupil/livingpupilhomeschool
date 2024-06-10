import { validateSession } from '@/config/api-validation';
import { getStudentRecords } from '@/prisma/services/student-record';
import { updateStudentStatus } from '@/prisma/services/student-record';
import { sendMail } from '@/lib/server/mail';
import { html, text } from '@/config/email-templates/enrollment-update';


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
                accreditation,
                birthCertificateLink,
                enrollmentType,
                incomingGradeLevel,
                payment,
                paymentMethod,
                pictureLink,
                program,
                reportCardLink,
                schoolFeeUrl,
                email,
                studentStatus
            } = req.body;
            if (!studentId) {
                return res.status(400).json({ error: 'Student ID is required' });
            }
            // update student records
            const newStudentStatus = await Promise.all([
                updateStudentStatus(studentId, studentStatus),
            ]);
            await sendMail({
                html: html({
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
                    schoolFeeUrl,
                    email
                }),
                subject: `[Living Pupil Homeschool] Updated ${firstName}'s Student Record`,
                text: text({
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
                    schoolFeeUrl,
                    email
                }),
                to: [email],
            });
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
