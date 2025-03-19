import { validateSession } from '@/config/api-validation';
import { updateParentTrainingStatus, getParentTrainings } from '@/prisma/services/parent-training';


const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        await validateSession(req, res);
        const parentTraining = await getParentTrainings();
        res.status(200).json({ data: { parentTraining } });
    } else if (method === 'PATCH') {
        try {
            const {
                courseCode,
                guardianId,
                schoolYear,
                trainingStatus
            } = req.body;
            console.log(courseCode + guardianId + schoolYear)
            await Promise.all([updateParentTrainingStatus(courseCode, guardianId, schoolYear, trainingStatus)]);

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
