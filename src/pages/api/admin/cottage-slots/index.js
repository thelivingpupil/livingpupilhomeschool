import { validateSession } from '@/config/api-validation';
import {
  createCottageSlot,
  deleteCottageSlot,
  getAllCottageSlots,
  getCottageSlotEnrollmentCounts,
  updateCottageSlot,
} from '@/prisma/services/cottage-slot';

const handler = async (req, res) => {
  const { method } = req;

  const session = await validateSession(req, res);

  if (!session || session.user?.userType !== 'ADMIN') {
    return res.status(403).json({
      errors: { error: { msg: 'Forbidden: Admin access required' } },
    });
  }

  if (method === 'GET') {
    try {
      const [cottageSlots, enrollmentCounts] = await Promise.all([
        getAllCottageSlots(),
        getCottageSlotEnrollmentCounts(),
      ]);

      return res.status(200).json({
        data: {
          cottageSlots: cottageSlots.map((slot) => ({
            ...slot,
            enrolledCount: enrollmentCounts[slot.id] || 0,
          })),
        },
      });
    } catch (error) {
      console.error('Error fetching cottage slots:', error);
      return res.status(500).json({
        errors: { error: { msg: 'Failed to fetch cottage slots' } },
      });
    }
  }

  if (method === 'POST') {
    try {
      const { cottageSlotName, schoolYear, gradeTarget, timeslot, slots } = req.body;

      if (!cottageSlotName || !schoolYear || !gradeTarget || !timeslot) {
        return res.status(400).json({
          errors: {
            error: {
              msg: 'cottageSlotName, schoolYear, gradeTarget, and timeslot are required',
            },
          },
        });
      }

      const cottageSlot = await createCottageSlot({
        cottageSlotName,
        schoolYear,
        gradeTarget,
        timeslot,
        slots,
      });

      return res.status(201).json({ data: { cottageSlot } });
    } catch (error) {
      console.error('Error creating cottage slot:', error);

      if (error.code === 'P2002') {
        return res.status(409).json({
          errors: {
            error: {
              msg: 'A cottage slot with this name already exists for the selected school year and grade/form',
            },
          },
        });
      }

      return res.status(500).json({
        errors: {
          error: { msg: error.message || 'Failed to create cottage slot' },
        },
      });
    }
  }

  if (method === 'PUT') {
    try {
      const { id, cottageSlotName, schoolYear, gradeTarget, timeslot, slots } = req.body;

      if (!id) {
        return res.status(400).json({
          errors: { error: { msg: 'id is required' } },
        });
      }

      const cottageSlot = await updateCottageSlot(id, {
        cottageSlotName,
        schoolYear,
        gradeTarget,
        timeslot,
        slots,
      });

      return res.status(200).json({ data: { cottageSlot } });
    } catch (error) {
      console.error('Error updating cottage slot:', error);

      if (error.code === 'P2002') {
        return res.status(409).json({
          errors: {
            error: {
              msg: 'A cottage slot with this name already exists for the selected school year and grade/form',
            },
          },
        });
      }

      return res.status(500).json({
        errors: {
          error: { msg: error.message || 'Failed to update cottage slot' },
        },
      });
    }
  }

  if (method === 'DELETE') {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          errors: { error: { msg: 'id is required' } },
        });
      }

      await deleteCottageSlot(id);

      return res.status(200).json({
        data: { message: 'Cottage slot deleted successfully' },
      });
    } catch (error) {
      console.error('Error deleting cottage slot:', error);

      if (error.code === 'P2003') {
        return res.status(409).json({
          errors: {
            error: {
              msg: 'Cannot delete cottage slot with enrolled students',
            },
          },
        });
      }

      return res.status(500).json({
        errors: { error: { msg: 'Failed to delete cottage slot' } },
      });
    }
  }

  return res
    .status(405)
    .json({ errors: { error: { msg: `${method} method unsupported` } } });
};

export default handler;
