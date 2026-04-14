// eslint.config.js
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,

  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      /* 🔹 기본 코드 품질 */
      "no-unused-vars": "warn",
      "no-console": "warn",
      "no-debugger": "error",

      /* 🔹 JS 스타일 */
      eqeqeq: "error", // == 금지
      curly: "error", // {} 강제
      "prefer-const": "error",

      /* 🔹 기타 */
      "no-var": "error",
    },
  },
];
