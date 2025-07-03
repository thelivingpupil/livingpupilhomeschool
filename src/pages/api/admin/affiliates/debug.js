import { getAffiliateDataPerYear } from '@/prisma/services/user.js';
import prisma from '@/prisma/index';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log('=== DEBUGGING AFFILIATE DATA ===');

        // 1. Check total users
        const totalUsers = await prisma.user.count({
            where: { deletedAt: null }
        });
        console.log(`Total users: ${totalUsers}`);

        // 2. Check users with userCode
        const allUsers = await prisma.user.findMany({
            where: { deletedAt: null },
            select: { userCode: true }
        });
        const usersWithUserCode = allUsers.filter(user => user.userCode).length;
        console.log(`Users with userCode: ${usersWithUserCode}`);

        // 3. Check users with inviteCode
        const allUsersWithInviteCode = await prisma.user.findMany({
            where: { deletedAt: null },
            select: { inviteCode: true }
        });
        const usersWithInviteCode = allUsersWithInviteCode.filter(user => user.inviteCode).length;
        console.log(`Users with inviteCode: ${usersWithInviteCode}`);

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
        console.log('Sample affiliates:', sampleAffiliates);

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
        console.log('Sample invitees:', sampleInvitees);

        // 6. Check workspaces with student records
        const workspacesWithStudents = await prisma.workspace.count({
            where: {
                studentRecord: { not: null }
            }
        });
        console.log(`Workspaces with student records: ${workspacesWithStudents}`);

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

        console.log('Affiliate relationships found:', affiliateRelationships.length);
        console.log('Sample relationships:', affiliateRelationships);

        // 8. Test the actual affiliate function for 2024
        const affiliateData = await getAffiliateDataPerYear(2024);
        console.log(`Affiliate data for 2024: ${affiliateData.length} affiliates`);

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