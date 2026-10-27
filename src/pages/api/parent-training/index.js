import { validateSession } from '@/config/api-validation';
import {
    canManageGuardianTrainings,
    getParentTrainings,
    updateParentTrainingStatus,
} from '@/prisma/services/parent-training';

const TRAINING_STATUSES = ['FINISHED', 'UNFINISHED'];

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        const session = await validateSession(req, res);
        if (!session) return;

        if (session.user?.userType !== 'ADMIN') {
            return res.status(403).json({
                errors: { error: { msg: 'Forbidden: Admin access required' } },
            });
        }

        const parentTraining = await getParentTrainings();
        res.status(200).json({ data: { parentTraining } });
    } else if (method === 'PATCH') {
        const session = await validateSession(req, res);
        if (!session) return;

        try {
            const {
                courseCode,
                guardianId,
                schoolYear,
                trainingStatus
            } = req.body || {};

            if (!courseCode || !guardianId || !schoolYear || !trainingStatus) {
                return res.status(400).json({
                    errors: {
                        error: {
                            msg: 'courseCode, guardianId, schoolYear, and trainingStatus are required',
                        },
                    },
                });
            }

            if (!TRAINING_STATUSES.includes(trainingStatus)) {
                return res.status(400).json({
                    errors: { error: { msg: 'Invalid training status' } },
                });
            }

            const isAdmin = session.user?.userType === 'ADMIN';
            if (
                !isAdmin &&
                !(await canManageGuardianTrainings(
                    session.user.userId,
                    session.user.email,
                    guardianId
                ))
            ) {
                return res.status(403).json({
                    errors: { error: { msg: 'Forbidden: You cannot update this training' } },
                });
            }

            const result = await updateParentTrainingStatus(
                courseCode,
                guardianId,
                schoolYear,
                trainingStatus
            );

            if (result.count === 0) {
                return res.status(404).json({
                    errors: { error: { msg: 'Parent training not found' } },
                });
            }

            res.status(200).json({ message: 'Student status updated successfully' });
        } catch (error) {
            console.error('Error updating parent training status:', error);
            res.status(500).json({ error: 'Failed to update parent training status' });
        }
    } else {
        res.status(405).json({ error: `${method} method unsupported` });
    }
};

export default handler;
