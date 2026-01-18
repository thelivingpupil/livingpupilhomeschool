import { validateSession } from '@/config/api-validation';
import { getStudentRecords } from '@/prisma/services/student-record';
import { updateStudentStatus } from '@/prisma/services/student-record';
import { sendMail } from '@/lib/server/mail';
import { html, text } from '@/config/email-templates/initial-acceptance';
import {
    html as acceptanceHtml,
    text as acceptanceText,
} from '@/config/email-templates/letter-of-acceptance';
import {
    html as initialAcceptance2025Html,
    text as initialAcceptance2025Text,
} from '@/config/email-templates/initial-acceptance2025';
import { getParentFirstName } from '@/utils/index';
import { GRADE_TO_FORM_MAP } from '@/utils/constants';
import {
    html as initialPreschool2025Html,
    text as initialpreschool2025Text,
} from '@/config/email-templates/initial-acceptance-2025-2026/preschool';
import {
    html as initialKindergarten2025Html,
    text as initialKindergarten2025Text,
} from '@/config/email-templates/initial-acceptance-2025-2026/kindergarten';
import {
    html as initialGradeschool2025Html,
    text as initialGradeschool2025Text,
} from '@/config/email-templates/initial-acceptance-2025-2026/gradeschool';
import {
    html as initialHighschool2025Html,
    text as initialHighschool2025Text,
} from '@/config/email-templates/initial-acceptance-2025-2026/highschool';
// TODO: Uncomment when email templates are ready for 2026-2027
// import {
//     html as initialSenior2025Html,
//     text as initialSenior2025Text,
// } from '@/config/email-templates/initial-acceptance-2025-2026/senior-high';
// import {
//     html as initialCottage2025Html,
//     text as initialCottage2025Text,
// } from '@/config/email-templates/initial-acceptance-2025-2026/cottage-all';


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
                schoolYear,
            } = req.body;
            if (!studentId) {
                return res.status(400).json({ error: 'Student ID is required' });
            }
            // update student records
            const newStudentStatus = await Promise.all([
                updateStudentStatus(studentId, studentStatus),
            ]);

            const parentFirstName = getParentFirstName(primaryGuardianName);

            if (studentStatus === 'INITIALLY_ENROLLED') {
                if (schoolYear === "2026-2027") {
                    if (program === "HOMESCHOOL_PROGRAM") {
                        if (incomingGradeLevel === "PRESCHOOL") {
                            await sendMail({
                                html: initialPreschool2025Html({
                                    parentFirstName,
                                }),
                                subject: `Welcome to Living Pupil Homeschool! Onboarding Guide & Next Steps (SY 2026-2027)`,
                                text: initialpreschool2025Text({
                                    parentFirstName,
                                    firstName,
                                }),
                                to: [email],
                            });
                        } else if (incomingGradeLevel === "K1" || incomingGradeLevel === "K2") {
                            await sendMail({
                                html: initialKindergarten2025Html({
                                    parentFirstName,
                                }),
                                subject: `Welcome to Living Pupil Homeschool! Onboarding Guide & Next Steps (SY 2026-2027)`,
                                text: initialKindergarten2025Text({
                                    parentFirstName,
                                    firstName,
                                }),
                                to: [email],
                            });
                        } else if (incomingGradeLevel === "GRADE_1" ||
                            incomingGradeLevel === "GRADE_2" ||
                            incomingGradeLevel === "GRADE_3" ||
                            incomingGradeLevel === "GRADE_4" ||
                            incomingGradeLevel === "GRADE_5" ||
                            incomingGradeLevel === "GRADE_6"
                        ) {
                            await sendMail({
                                html: initialGradeschool2025Html({
                                    parentFirstName,
                                }),
                                subject: `Welcome to Living Pupil Homeschool! Onboarding Guide & Next Steps (SY 2026-2027)`,
                                text: initialGradeschool2025Text({
                                    parentFirstName,
                                    firstName,
                                }),
                                to: [email],
                            });
                        } else if (incomingGradeLevel === "GRADE_7" ||
                            incomingGradeLevel === "GRADE_8" ||
                            incomingGradeLevel === "GRADE_9" ||
                            incomingGradeLevel === "GRADE_10"
                        ) {
                            await sendMail({
                                html: initialHighschool2025Html({
                                    parentFirstName,
                                }),
                                subject: `Welcome to Living Pupil Homeschool! Onboarding Guide & Next Steps (SY 2026-2027)`,
                                text: initialHighschool2025Text({
                                    parentFirstName,
                                    firstName,
                                }),
                                to: [email],
                            });
                        } else if (incomingGradeLevel === "GRADE_11" || incomingGradeLevel === "GRADE_12") {
                            // TODO: Senior High email template for 2026-2027 will be updated later
                            res.status(500).json({ error: 'Senior High email template for 2026-2027 is not yet available. Please contact admin.' });
                        } else {
                            res.status(500).json({ error: 'Invalid Grade Level' });
                        }

                    } else if (program === "HOMESCHOOL_COTTAGE") {
                        // TODO: Cottage email template for 2026-2027 will be updated later
                        res.status(500).json({ error: 'Cottage email template for 2026-2027 is not yet available. Please contact admin.' });
                    } else {
                        res.status(500).json({ error: 'Invalid Program' });
                    }

                } else if (schoolYear === "2024-2025") {
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
                } else {
                    res.status(500).json({ error: 'School Year invalid' });
                }
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
                res.status(500).json({ error: 'No action taken' });
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
