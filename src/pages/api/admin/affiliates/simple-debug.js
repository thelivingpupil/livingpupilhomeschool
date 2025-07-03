const { PrismaClient } = require('../../../../prisma/node_modules/@prisma/client');
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log('=== SIMPLE DEBUG ===');

        // 1. Check total users
        const totalUsers = await prisma.user.count({
            where: { deletedAt: null }
        });
        console.log(`Total users: ${totalUsers}`);

        // 2. Get a few sample users
        const sampleUsers = await prisma.user.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                name: true,
                email: true,
                userCode: true,
                inviteCode: true,
                createdAt: true
            },
            take: 10
        });

        // 3. Count users with userCode and inviteCode
        const usersWithUserCode = sampleUsers.filter(user => user.userCode).length;
        const usersWithInviteCode = sampleUsers.filter(user => user.inviteCode).length;

        return res.status(200).json({
            success: true,
            debug: {
                totalUsers,
                usersWithUserCode,
                usersWithInviteCode,
                sampleUsers
            }
        });

    } catch (error) {
        console.error('Simple debug error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
} 