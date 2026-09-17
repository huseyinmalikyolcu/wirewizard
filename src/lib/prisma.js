import { PrismaClient } from '@prisma/client';

// Geliştirmede hot-reload'da birden fazla bağlantı açılmasını önler.
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
