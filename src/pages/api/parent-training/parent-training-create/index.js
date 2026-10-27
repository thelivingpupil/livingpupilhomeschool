import { GradeLevel } from '@prisma/client';
import { validateSession } from '@/config/api-validation';
import { createParentTrainingsForGrade } from '@/prisma/services/parent-training';
import parentTrainingHandler from '../index';

const GRADE_LEVELS = Object.values(GradeLevel);
const TRAINING_STATUSES = ['FINISHED', 'UNFINISHED'];

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET' || method === 'PATCH') {
        return parentTrainingHandler(req, res);
    } else if (method === 'POST') {
        const session = await validateSession(req, res);
        if (!session) return;

        if (session.user?.userType !== 'ADMIN') {
            return res.status(403).json({
                errors: { error: { msg: 'Forbidden: Admin access required' } },
            });
        }

        try {
            const {
                gradeLevel,
                guardianId,
                schoolYear,
                status
            } = req.body || {};

            if (!gradeLevel || !guardianId || !schoolYear || !status) {
                return res.status(400).json({
                    errors: {
                        error: {
                            msg: 'gradeLevel, guardianId, schoolYear, and status are required',
                        },
                    },
                });
            }

            if (!GRADE_LEVELS.includes(gradeLevel)) {
                return res.status(400).json({
                    errors: { error: { msg: 'Invalid grade level' } },
                });
            }

            if (!TRAINING_STATUSES.includes(status)) {
                return res.status(400).json({
                    errors: { error: { msg: 'Invalid training status' } },
                });
            }

            await createParentTrainingsForGrade(gradeLevel, guardianId, schoolYear, status);

            res.status(200).json({ message: 'Parent trainings created successfully' });
        } catch (error) {
            console.error('Error creating parent trainings:', error);
            res.status(500).json({ error: 'Failed to create parent trainings' });
        }
    } else {
        res.status(405).json({ error: `${method} method unsupported` });
    }
};

export default handler;
