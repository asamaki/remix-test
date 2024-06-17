/**
 * This is intended to be a basic starting point for linting in your app.
 * It relies on recommended configs out of the box for simplicity, but you can
 * and should modify this configuration to best suit your team's needs.
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },

  ignorePatterns: ["!**/.server", "!**/.client"],

  // Base config
  extends: ["eslint:recommended"],

  overrides: [
    // React
    {
      files: ["**/*.{js,jsx,ts,tsx}"],
      plugins: ["react", "jsx-a11y"],
      extends: [
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
      ],
      settings: {
        react: {
          version: "detect",
        },
        formComponents: ["Form"],
        linkComponents: [
          { name: "Link", linkAttribute: "to" },
          { name: "NavLink", linkAttribute: "to" },
        ],
        "import/resolver": {
          typescript: {},
        },
      },
    },

    // Typescript
    {
      files: ["**/*.{ts,tsx}"],
      plugins: ["@typescript-eslint", "import"],
      parser: "@typescript-eslint/parser",
      settings: {
        "import/internal-regex": "^~/",
        "import/resolver": {
          node: {
            extensions: [".ts", ".tsx"],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
      ],
    },
    {
      files: ["app/**/*"],  // 特定のフォルダ内のファイルを指定
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            "selector": "Program > VariableDeclaration",
            "message": "!!!危険!!! グローバルスコープでの変数定義は危険です。このプロジェクトでは、安全性を考慮し、デフォルトで禁止されています。変数定義を許可する場合は、チームで相談のうえ、最新のセキュリティ対策を講じた上で利用してください。no-restricted-syntaxエラーを無視する場合は、変数の宣言行の直前に // eslint-disable-next-line no-restricted-syntax とコメントを追加してください。"
          },
          {
            "selector": "Program > ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > Literal",
            "message": "!!!危険!!! グローバルスコープでの変数定義は危険です。このプロジェクトでは、安全性を考慮し、デフォルトで禁止されています。変数定義を許可する場合は、チームで相談のうえ、最新のセキュリティ対策を講じた上で利用してください。no-restricted-syntaxエラーを無視する場合は、変数の宣言行の直前に // eslint-disable-next-line no-restricted-syntax とコメントを追加してください。"
          },

        ]
      }
    },

    // Node
    {
      files: [".eslintrc.cjs"],
      env: {
        node: true,
      },
    },
  ],
};
