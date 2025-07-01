/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: { jsx: true }
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  plugins: ["react", "react-hooks", "@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  rules: {
    // Customize to taste:
    "react/react-in-jsx-scope": "off", // Needed for React 17+
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "warn"
  },
  ignorePatterns: ["node_modules", "./dist/*", "./build/*", "*.log"]
};
