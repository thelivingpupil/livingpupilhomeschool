import prisma from '@/prisma/index';
import {
  COTTAGE_SLOT_FORM_TARGETS,
  COTTAGE_SLOT_GRADE_TARGETS,
  GRADE_TO_FORM_MAP,
  cottageSlotMatchesGrade,
} from '@/utils/constants';
import { Program } from '@prisma/client';

const ALL_COTTAGE_SLOT_GRADE_TARGETS = [
  ...COTTAGE_SLOT_GRADE_TARGETS,
  ...COTTAGE_SLOT_FORM_TARGETS,
];

const getGradeTargetsForStudent = (incomingGradeLevel) => {
  const formTarget = GRADE_TO_FORM_MAP[incomingGradeLevel];
  const targets = [incomingGradeLevel];
  if (formTarget && formTarget !== incomingGradeLevel) {
    targets.push(formTarget);
  }
  return targets.filter((target) =>
    ALL_COTTAGE_SLOT_GRADE_TARGETS.includes(target),
  );
};

const getCottageSlotWhere = (incomingGradeLevel, schoolYear) => {
  const gradeTargets = getGradeTargetsForStudent(incomingGradeLevel);

  if (!schoolYear || gradeTargets.length === 0) {
    return null;
  }

  return {
    schoolYear,
    gradeTarget: { in: gradeTargets },
  };
};

export const isValidCottageSlotGradeTarget = (gradeTarget) =>
  COTTAGE_SLOT_GRADE_TARGETS.includes(gradeTarget) ||
  COTTAGE_SLOT_FORM_TARGETS.includes(gradeTarget);

export const slotMatchesStudentGrade = (cottageSlot, incomingGradeLevel) =>
  cottageSlotMatchesGrade(cottageSlot.gradeTarget, incomingGradeLevel);

export const getCottageSlotsForStudentGrade = async (
  incomingGradeLevel,
  schoolYear,
) => {
  const where = getCottageSlotWhere(incomingGradeLevel, schoolYear);

  if (!where) {
    return [];
  }

  return prisma.cottageSlot.findMany({
    where,
    orderBy: [
      { schoolYear: 'desc' },
      { gradeTarget: 'asc' },
      { cottageSlotName: 'asc' },
    ],
  });
};

export const getAvailableCottageSlotsForStudentGrade = async (
  incomingGradeLevel,
  schoolYear,
) => {
  const slots = await getCottageSlotsForStudentGrade(
    incomingGradeLevel,
    schoolYear,
  );
  return slots.filter((slot) => slot.slots > 0);
};

export const gradeHasAvailableCottageSlots = async (
  incomingGradeLevel,
  schoolYear,
) => {
  const where = getCottageSlotWhere(incomingGradeLevel, schoolYear);

  if (!where) {
    return false;
  }

  const count = await prisma.cottageSlot.count({
    where: {
      ...where,
      slots: { gt: 0 },
    },
  });
  return count > 0;
};

export const getCottageSlotById = async (id) =>
  prisma.cottageSlot.findUnique({ where: { id } });

export const reserveCottageSlot = async (cottageSlotId, tx = prisma) => {
  const updated = await tx.cottageSlot.updateMany({
    where: { id: cottageSlotId, slots: { gt: 0 } },
    data: { slots: { decrement: 1 } },
  });

  if (updated.count === 0) {
    throw new Error('Slot no longer available');
  }

  return tx.cottageSlot.findUnique({ where: { id: cottageSlotId } });
};

export const getAllCottageSlots = async () =>
  prisma.cottageSlot.findMany({
    orderBy: [
      { schoolYear: 'desc' },
      { gradeTarget: 'asc' },
      { cottageSlotName: 'asc' },
    ],
  });

export const getCottageSlotEnrollmentCounts = async () => {
  const counts = await prisma.studentRecord.groupBy({
    by: ['cottageSlotId'],
    where: {
      deletedAt: null,
      cottageSlotId: { not: null },
      student: { deletedAt: null },
    },
    _count: true,
  });

  return counts.reduce((acc, row) => {
    if (row.cottageSlotId) {
      acc[row.cottageSlotId] = row._count;
    }
    return acc;
  }, {});
};

export const createCottageSlot = async ({
  cottageSlotName,
  schoolYear,
  gradeTarget,
  timeslot,
  slots,
}) => {
  if (!schoolYear) {
    throw new Error('School year is required');
  }

  if (!isValidCottageSlotGradeTarget(gradeTarget)) {
    throw new Error('Invalid cottage slot grade target');
  }

  return prisma.cottageSlot.create({
    data: {
      cottageSlotName,
      schoolYear,
      gradeTarget,
      timeslot,
      slots: Number(slots) || 0,
    },
  });
};

export const updateCottageSlot = async (
  id,
  { cottageSlotName, schoolYear, gradeTarget, timeslot, slots },
) => {
  if (gradeTarget && !isValidCottageSlotGradeTarget(gradeTarget)) {
    throw new Error('Invalid cottage slot grade target');
  }

  return prisma.cottageSlot.update({
    where: { id },
    data: {
      ...(cottageSlotName !== undefined ? { cottageSlotName } : {}),
      ...(schoolYear !== undefined ? { schoolYear } : {}),
      ...(gradeTarget !== undefined ? { gradeTarget } : {}),
      ...(timeslot !== undefined ? { timeslot } : {}),
      ...(slots !== undefined ? { slots: Number(slots) } : {}),
    },
  });
};

export const deleteCottageSlot = async (id) =>
  prisma.cottageSlot.delete({ where: { id } });

export class CottageSlotError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'CottageSlotError';
    this.statusCode = statusCode;
  }
}

export const assertCottageSlotForEnrollment = async (
  program,
  cottageSlotId,
  incomingGradeLevel,
  schoolYear,
) => {
  if (program !== Program.HOMESCHOOL_COTTAGE) {
    return null;
  }

  if (!cottageSlotId) {
    throw new CottageSlotError('Cottage time slot is required');
  }

  const slot = await getCottageSlotById(cottageSlotId);

  if (!slot) {
    throw new CottageSlotError('Cottage time slot not found', 404);
  }

  if (slot.schoolYear !== schoolYear) {
    throw new CottageSlotError(
      'Selected cottage time slot does not match school year',
    );
  }

  if (!slotMatchesStudentGrade(slot, incomingGradeLevel)) {
    throw new CottageSlotError(
      'Selected cottage time slot does not match student grade level',
    );
  }

  if (slot.slots <= 0) {
    throw new CottageSlotError(
      'That time slot is no longer available',
      409,
    );
  }

  return slot;
};

export const enrollStudentWithCottageSlot = async (
  program,
  cottageSlotId,
  incomingGradeLevel,
  schoolYear,
  createRecord,
) => {
  if (program !== Program.HOMESCHOOL_COTTAGE) {
    return createRecord(prisma);
  }

  await assertCottageSlotForEnrollment(
    program,
    cottageSlotId,
    incomingGradeLevel,
    schoolYear,
  );

  try {
    return await prisma.$transaction(async (tx) => {
      await reserveCottageSlot(cottageSlotId, tx);
      return createRecord(tx);
    });
  } catch (error) {
    if (error.message === 'Slot no longer available') {
      throw new CottageSlotError(
        'That time slot is no longer available',
        409,
      );
    }
    throw error;
  }
};
