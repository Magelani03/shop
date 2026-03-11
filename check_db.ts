import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: 'file:./prisma/dev.db',
            },
        },
    });

    try {
        const users = await prisma.user.findMany();
        console.log('Users in dev.db:', JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error querying dev.db:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
