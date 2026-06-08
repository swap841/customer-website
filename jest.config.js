/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/__tests__"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@tanstack|lucide-react|sonner|next-themes)/)",
  ],
  testMatch: ["**/__tests__/**/*.test.{js,ts,tsx}"],
};
