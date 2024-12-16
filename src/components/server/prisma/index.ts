import { PrismaClient } from "@prisma/client";

type G = {
  prisma?: PrismaClient;
};

const db = (global as G).prisma ? (global as G).prisma! : (global as G).prisma = new PrismaClient();

export default db;
