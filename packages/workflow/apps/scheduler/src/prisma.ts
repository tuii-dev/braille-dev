/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@jptr/braille-prisma';

export const prisma = new PrismaClient({
  log: ['info'],
});
