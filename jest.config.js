export default {
  clearMocks: true,
  transform: {
    "^.+\\.ts$": "<rootDir>/scripts/jest-ts-transformer.ts",
  },
  setupFiles: ["<rootDir>/tests/setupEnv.js"],
  testEnvironment: "jsdom",
  coverageProvider: "v8",
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/tests/e2e/",
    "<rootDir>/tests/hono.test.ts",
  ],
  modulePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/tests/e2e/"],
  coveragePathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/tests/E2E/",
  ],
  extensionsToTreatAsEsm: [".ts"],
};
