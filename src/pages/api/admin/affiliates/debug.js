import { getAffiliateDataPerYear } from '@/prisma/services/user.js';
import prisma from '@/prisma/index';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Authenticate and authorize - only ADMIN users can access debug endpoint
        const session = await getSession({ req });

        if (!session || session.user?.userType !== 'ADMIN') {
            return res.status(403).json({
                errors: { error: { msg: 'Forbidden: Admin access required' } }
            });
        }

        // 1. Check total users
        const totalUsers = await prisma.user.count({
            where: { deletedAt: null }
        });

        // 2. Check users with userCode
        const allUsers = await prisma.user.findMany({
            where: { deletedAt: null },
            select: { userCode: true }
        });
        const usersWithUserCode = allUsers.filter(user => user.userCode).length;

        // 3. Check users with inviteCode
        const allUsersWithInviteCode = await prisma.user.findMany({
            where: { deletedAt: null },
            select: { inviteCode: true }
        });
        const usersWithInviteCode = allUsersWithInviteCode.filter(user => user.inviteCode).length;

        // 4. Get sample of users with userCode
        const allUsersForAffiliates = await prisma.user.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                name: true,
                email: true,
                userCode: true,
                createdAt: true
            }
        });
        const sampleAffiliates = allUsersForAffiliates.filter(user => user.userCode).slice(0, 5);

        // 5. Get sample of users with inviteCode
        const allUsersForInvitees = await prisma.user.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                name: true,
                email: true,
                inviteCode: true,
                createdAt: true
            }
        });
        const sampleInvitees = allUsersForInvitees.filter(user => user.inviteCode).slice(0, 5);

        // 6. Check workspaces with student records
        const workspacesWithStudents = await prisma.workspace.count({
            where: {
                studentRecord: { not: null }
            }
        });

        // 7. Check for any affiliate relationships that exist
        const allUsersForRelationships = await prisma.user.findMany({
            where: { deletedAt: null },
            select: {
                inviteCode: true,
                createdAt: true,
                createdWorkspace: {
                    select: {
                        id: true,
                        studentRecord: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });
        const affiliateRelationships = allUsersForRelationships.filter(user => user.inviteCode).slice(0, 10);

        // 8. Test the actual affiliate function for 2024
        const affiliateData = await getAffiliateDataPerYear(2024);

        return res.status(200).json({
            success: true,
            debug: {
                totalUsers,
                usersWithUserCode,
                usersWithInviteCode,
                workspacesWithStudents,
                sampleAffiliates,
                sampleInvitees,
                affiliateRelationships: affiliateRelationships.length,
                affiliateDataCount: affiliateData.length
            }
        });

    } catch (error) {
        console.error('Debug error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
} 