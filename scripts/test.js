const path = require("node:path");
const { spawnSync } = require("node:child_process");
const dotenv = require("dotenv");

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

function databaseIdentity(connectionString) {
  const parsed = new URL(connectionString);
  return `${parsed.protocol}//${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`;
}

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required. Create a dedicated test database and set it in .env.test.");
}

if (process.env.DATABASE_URL &&
    databaseIdentity(process.env.DATABASE_URL) === databaseIdentity(testDatabaseUrl)) {
  throw new Error("Tests refuse to run because DATABASE_URL and TEST_DATABASE_URL identify the same database.");
}

function runNodeScript(script, args, env) {
  const result = spawnSync(process.execPath, [script, ...args], { stdio: "inherit", env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

const prismaCli = require.resolve("prisma/build/index.js");
const jestCli = require.resolve("jest/bin/jest");

runNodeScript(
  prismaCli,
  ["db", "push", "--skip-generate"],
  { ...process.env, DATABASE_URL: testDatabaseUrl }
);
runNodeScript(jestCli, ["--runInBand"], process.env);
