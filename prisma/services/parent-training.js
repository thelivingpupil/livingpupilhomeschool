import prisma from '@/prisma/index';
import { getParentTrainingCodesForStudent, SCHOOL_YEAR } from '@/utils/constants';

export const createParentTrainingsForGrade = async (
    gradeLevel,
    guardianId,
    schoolYear,
    status,
    studentRecord
) => {
    const courseCodes = getParentTrainingCodesForStudent(gradeLevel, studentRecord);

    if (courseCodes.length === 0) {
        console.warn(`No trainings found for grade level: ${gradeLevel}`);
        return;
    }

    const trainingPromises = courseCodes.map((courseCode) =>
        createParentTraining(courseCode, guardianId, schoolYear, status)
    );

    await Promise.all(trainingPromises);
};

export const getExpectedParentTrainingCodes = (studentRecords) => [
    ...new Set(
        studentRecords.flatMap((record) =>
            getParentTrainingCodesForStudent(record.incomingGradeLevel, record)
        )
    ),
];

export const planParentTrainingSync = (expectedCodes, trainings) => {
    const expected = new Set(expectedCodes);
    const active = trainings.filter((training) => !training.deletedAt);
    const activeCodes = new Set(active.map((training) => training.courseCode));

    const toCreate = [];
    const toRestore = [];

    expectedCodes.forEach((courseCode) => {
        if (activeCodes.has(courseCode)) return;

        const [deleted] = trainings
            .filter((training) => training.deletedAt && training.courseCode === courseCode)
            .sort(
                (a, b) =>
                    (b.status === 'FINISHED') - (a.status === 'FINISHED') ||
                    new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
            );

        if (deleted) {
            toRestore.push(deleted);
        } else {
            toCreate.push(courseCode);
        }
    });

    const toRemove = active.filter(
        (training) => !expected.has(training.courseCode) && training.status === 'UNFINISHED'
    );

    return { toCreate, toRestore, toRemove };
};

export const syncParentTrainingsForGuardian = async (guardianId, schoolYear) => {
    if (!guardianId || !schoolYear) return null;

    const guardian = await prisma.guardianInformation.findUnique({
        where: { id: guardianId },
        select: { userId: true },
    });
    if (!guardian) return null;

    const [studentRecords, trainings] = await Promise.all([
        prisma.studentRecord.findMany({
            where: {
                schoolYear,
                deletedAt: null,
                student: { deletedAt: null, creatorId: guardian.userId },
            },
            select: {
                incomingGradeLevel: true,
                accreditation: true,
                partnerSchool: true,
            },
        }),
        prisma.parentTraining.findMany({
            where: { guardianId, schoolYear },
            select: {
                id: true,
                courseCode: true,
                status: true,
                deletedAt: true,
                updatedAt: true,
            },
        }),
    ]);

    if (studentRecords.length === 0) return null;

    const plan = planParentTrainingSync(
        getExpectedParentTrainingCodes(studentRecords),
        trainings
    );

    await Promise.all(
        plan.toCreate.map((courseCode) =>
            createParentTraining(courseCode, guardianId, schoolYear, 'UNFINISHED')
        )
    );

    if (plan.toRestore.length > 0) {
        await prisma.parentTraining.updateMany({
            where: { id: { in: plan.toRestore.map((training) => training.id) } },
            data: { deletedAt: null },
        });
    }

    if (plan.toRemove.length > 0) {
        await prisma.parentTraining.updateMany({
            where: {
                id: { in: plan.toRemove.map((training) => training.id) },
                status: 'UNFINISHED',
                deletedAt: null,
            },
            data: { deletedAt: new Date() },
        });
    }

    return plan;
};

export const syncParentTrainingsForStudent = async (studentRecord) => {
    if (!studentRecord?.studentId || !studentRecord.schoolYear) return null;

    const workspace = await prisma.workspace.findUnique({
        where: { id: studentRecord.studentId },
        select: {
            creator: {
                select: {
                    guardianInformation: {
                        select: { id: true },
                    },
                },
            },
        },
    });

    return syncParentTrainingsForGuardian(
        workspace?.creator?.guardianInformation?.id,
        studentRecord.schoolYear
    );
};

export const createParentTraining = async (courseCode, guardianId, schoolYear, status) => {
    const existingTraining = await prisma.parentTraining.findFirst({
        where: {
            courseCode,
            guardianId,
            schoolYear
        }
    });

    if (existingTraining) {
        console.log(`Skipping duplicate: ${courseCode} for guardian ${guardianId}`);
        return;
    }

    await prisma.parentTraining.create({
        data: {
            courseCode,
            schoolYear,
            status,
            guardianId
        }
    });
};


export const updateParentTrainingStatus = async (courseCode, guardianId, schoolYear, newTrainingStatus) =>
    await prisma.parentTraining.updateMany({
        data: {
            status: newTrainingStatus,
        },
        where: {
            courseCode,
            guardianId,
            schoolYear,
            deletedAt: null,
        },
    });

export const canManageGuardianTrainings = async (userId, email, guardianId) => {
    const guardian = await prisma.guardianInformation.findUnique({
        where: { id: guardianId },
        select: { userId: true },
    });

    if (!guardian) return false;
    if (guardian.userId === userId) return true;
    if (!email) return false;

    const sharedWorkspace = await prisma.workspace.findFirst({
        where: {
            creatorId: guardian.userId,
            deletedAt: null,
            members: { some: { email, deletedAt: null } },
        },
        select: { id: true },
    });

    return !!sharedWorkspace;
};

export const getParentTrainings = async () =>
    await prisma.parentTraining.findMany({
        where: {
            schoolYear: SCHOOL_YEAR.SY_2026_2027,
            deletedAt: null,
        },
        select: {
            id: true,
            guardianId: true,
            courseCode: true,
            status: true,
            schoolYear: true,
            createdAt: true,
            deletedAt: true,
            updatedAt: true,
            guardian: {
                select: {
                    primaryGuardianName: true,
                    anotherEmail: true,
                    user: {
                        select: {
                            email: true,
                            id: true,
                            createdWorkspace: {
                                select: {
                                    slug: true,
                                    studentRecord: {
                                        select: {
                                            enrollmentType: true,
                                            schoolYear: true,
                                            studentStatus: true,
                                            deletedAt: true,
                                        },
                                    },
                                },
                                where: {
                                    deletedAt: null
                                },
                                orderBy: {
                                    createdAt: 'desc'
                                }
                            }
                        }
                    }
                }
            }
        }
    });

export const getGuardianInformationID = async (userId) => {
    const guardianInfo = await prisma.guardianInformation.findUnique({
        where: { userId },
        select: { id: true }, // Only fetch the ID
    });

    return guardianInfo ? guardianInfo.id : null;
};
