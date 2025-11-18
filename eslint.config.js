import { base } from "@cprussin/eslint-config";

export default [
  ...base,
  {
    rules: {
      "unicorn/filename-case": "off",
      "unicorn/no-null": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "no-console": "off",
    },
  },
];
