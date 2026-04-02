// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

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
    plugins: {
      react,
      "react-hooks": reactHooks,
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

      /* 🔹 React */
      "react/react-in-jsx-scope": "off", // Vite/React 17+ 필요 없음
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",

      /* 🔹 React Hooks */
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      /* 🔹 기타 */
      "no-var": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
