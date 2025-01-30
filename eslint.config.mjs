import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node, // Allow Node.js globals
        ...globals.browser, // Allow browser globals
      },
    },
    rules: {
      "no-undef": "off", // Prevents ESLint from flagging test globals
    },
  },
];
