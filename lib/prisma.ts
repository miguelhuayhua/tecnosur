import { PrismaClient } from "@/prisma/generated"

const prismaClientSingleton = () => {
    return new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            }
        },
        // Añadir log para debugging
        log: ['query', 'error', 'warn'],
        // Ajustar pool de conexiones

    })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = global.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") global.prisma = prisma

export { prisma }