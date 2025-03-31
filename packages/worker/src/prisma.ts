import { PrismaClient } from '@jptr/braille-prisma';

export const prisma = new PrismaClient({
  log: ['info'],
});
