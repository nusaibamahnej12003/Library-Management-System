module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/integration/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  clearMocks: true,
  restoreMocks: true
};
