import prisma from '@/prisma/index';
import { PARENT_TRAINING_PER_GRADE_LEVEL } from '@/utils/constants';

export const createParentTrainingsForGrade = async (gradeLevel, guardianId, schoolYear, status) => {
    const trainings = PARENT_TRAINING_PER_GRADE_LEVEL[gradeLevel];

    if (!trainings || Object.keys(trainings).length === 0) {
        console.warn(`No trainings found for grade level: ${gradeLevel}`);
        return;
    }

    const trainingPromises = Object.keys(trainings).map((courseCode) =>
        createParentTraining(courseCode, guardianId, schoolYear, status)
    );

    await Promise.all(trainingPromises);
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
            schoolYear
        },
    });

export const getParentTrainings = async () =>
    await prisma.parentTraining.findMany({
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
                                    slug: true
                                },
                                where: {
                                    deletedAt: null
                                },
                                take: 1,
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
