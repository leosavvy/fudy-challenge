module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'import/no-unresolved': 2,
    'import/order': [
      2,
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
        pathGroups: [],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
    'max-len': [2, 120, 4, { ignoreComments: true, ignoreUrls: true }],
    'max-lines': [2, { max: 500, skipBlankLines: true, skipComments: true }],
    'sort-imports': [2, { ignoreDeclarationSort: true }],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};
