import pluginJs from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";

import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import pluginPromise from "eslint-plugin-promise";
import pluginReact from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ignores: ["**/fonts/**"],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  pluginJs.configs.recommended, // ? https://github.com/eslint/eslint
  importPlugin.flatConfigs.recommended, // ? https://github.com/import-js/eslint-plugin-import
  importPlugin.flatConfigs.typescript, // ? https://github.com/import-js/eslint-plugin-import
  ...tseslint.configs.recommended, // ? https://github.com/typescript-eslint/typescript-eslint
  pluginPromise.configs["flat/recommended"], // ? https://github.com/eslint-community/eslint-plugin-promise
  pluginReact.configs.flat.recommended, // ? https://github.com/jsx-eslint/eslint-plugin-react
  pluginReact.configs.flat["jsx-runtime"], // ? https://github.com/jsx-eslint/eslint-plugin-react
  eslintConfigPrettier, // ? https://github.com/prettier/eslint-config-prettier
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
      ],
    },
  }, // ? https://github.com/sweepline/eslint-plugin-unused-imports
  {
    rules: {
      "no-unused-vars": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/display-name": "off",
      "react/prop-types": "off",
      "newline-before-return": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/migration-from-tailwind-2": "off",
      "import/no-unresolved": "off",
      "import/no-named-as-default": "off",
      "object-shorthand": "warn",
      "prefer-destructuring": ["error", { object: true, array: false }],
      "import/newline-after-import": ["warn", { count: 1 }],
    },
  },
  // ! ===================== DISCLAIMER =====================
  // ! There is no official solution available for new ESLint 9 flat config structure for NextJS
  // ! The solution is taken from the community and may not be the best practice, use it at your own risk
  // ? Ref: https://github.com/vercel/next.js/discussions/49337?sort=top#discussioncomment-5998603
  // ! ======================================================
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@next/next/no-img-element": "off",
    },
  },
  {
    ignores: [".next/*"],
  },
];
