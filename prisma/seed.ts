import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import pg from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CsvRow {
  source: string;
  id: string;
  name: string;
  color: string;
  r_color: string;
}

async function main() {
  const csvPath = join(process.cwd(), "data", "marathonVol3.csv");
  const content = readFileSync(csvPath, "utf-8");
  const lines = content.trim().split("\n");
  const rows: CsvRow[] = lines.slice(1).map((line) => {
    const match = line.match(
      /^"([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)"$/
    );
    if (match) {
      return {
        source: match[1],
        id: match[2],
        name: match[3],
        color: match[4],
        r_color: match[5],
      };
    }
    const parts = line.split(",");
    return {
      source: parts[0]?.replace(/"/g, "") || "",
      id: parts[1]?.replace(/"/g, "") || "",
      name: parts[2]?.replace(/"/g, "") || "",
      color: parts[3]?.replace(/"/g, "") || "",
      r_color: parts[4]?.replace(/"/g, "") || "",
    };
  });

  const catalogNames = [...new Set(rows.map((r) => r.source))];

  console.log(`Found ${catalogNames.length} catalogs, ${rows.length} threads`);

  for (const catalogName of catalogNames) {
    const catalog = await prisma.catalog.upsert({
      where: { name: catalogName },
      update: {},
      create: { name: catalogName },
    });

    const catalogRows = rows.filter((r) => r.source === catalogName);

    for (const row of catalogRows) {
      const numberStr = row.id.replace("Color #", "");
      const number = parseInt(numberStr, 10);
      if (isNaN(number)) {
        console.warn(`Skipping invalid number: ${row.id}`);
        continue;
      }

      await prisma.thread.upsert({
        where: { number },
        update: {
          name: row.name,
          color: row.color,
        },
        create: {
          number,
          name: row.name,
          color: row.color,
          catalogId: catalog.id,
          hasBeen: false,
        },
      });
    }

    console.log(
      `Catalog "${catalogName}": ${catalogRows.length} threads seeded`
    );
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });