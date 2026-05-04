import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const threads = await prisma.thread.findMany({ take: 3 });
  console.log(JSON.stringify(threads, null, 2));
  await prisma.$disconnect();
  await pool.end();
}

main();
