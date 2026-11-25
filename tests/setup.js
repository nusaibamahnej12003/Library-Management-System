const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

function databaseIdentity(connectionString) {
  const parsed = new URL(connectionString);
  return `${parsed.protocol}//${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`;
}

if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL is required. Create a dedicated test database and set it in .env.test.");
}

if (process.env.DATABASE_URL &&
    databaseIdentity(process.env.DATABASE_URL) === databaseIdentity(process.env.TEST_DATABASE_URL)) {
  throw new Error("Tests refuse to run because DATABASE_URL and TEST_DATABASE_URL identify the same database.");
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const { prisma } = require("../src/config/database");

beforeEach(async () => {
  await prisma.borrowing.deleteMany();
  await prisma.book.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
