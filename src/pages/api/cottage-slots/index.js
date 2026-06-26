import { validateSession } from '@/config/api-validation';
import {
  getAvailableCottageSlotsForStudentGrade,
  gradeHasAvailableCottageSlots,
} from '@/prisma/services/cottage-slot';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    try {
      const session = await validateSession(req, res);

      if (!session) {
        return;
      }

      const { gradeLevel, schoolYear } = req.query;

      if (!gradeLevel || Array.isArray(gradeLevel)) {
        return res.status(400).json({
          errors: { error: { msg: 'gradeLevel query parameter is required' } },
        });
      }

      if (!schoolYear || Array.isArray(schoolYear)) {
        return res.status(400).json({
          errors: { error: { msg: 'schoolYear query parameter is required' } },
        });
      }

      const [slots, hasAvailable] = await Promise.all([
        getAvailableCottageSlotsForStudentGrade(gradeLevel, schoolYear),
        gradeHasAvailableCottageSlots(gradeLevel, schoolYear),
      ]);

      return res.status(200).json({
        data: {
          slots: slots.map(({ id, cottageSlotName, timeslot, slots: slotCount, schoolYear: slotSchoolYear }) => ({
            id,
            cottageSlotName,
            timeslot,
            slots: slotCount,
            schoolYear: slotSchoolYear,
          })),
          hasAvailable,
        },
      });
    } catch (error) {
      console.error('Error fetching cottage slots:', error);
      return res.status(500).json({
        errors: { error: { msg: 'Failed to fetch cottage slots' } },
      });
    }
  }

  return res
    .status(405)
    .json({ errors: { error: { msg: `${method} method unsupported` } } });
};

export default handler;
