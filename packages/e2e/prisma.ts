import { PrismaClient, Prisma } from "@jptr/braille-prisma";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export const dmmf = Prisma.dmmf;

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
