/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  plugins: ['@typescript-eslint', 'prettier', 'eslint-plugin-import-helpers'],
  extends: ['@remix-run/eslint-config', '@remix-run/eslint-config/node', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    'import-helpers/order-imports': [
      'warn',
      {
        groups: [['absolute', 'module'], ['type', '/^~/types/'], '/^~/routes/', ['sibling', 'parent', 'index']],
        newlinesBetween: 'always',
        alphabetize: { order: 'asc', ignoreCase: true },
      },
    ],
    'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unnecessary-type-constraint': 'off',
    'prettier/prettier': 'warn',
    'react/display-name': 'off',
    'react/jsx-sort-props': [
      'error',
      {
        noSortAlphabetically: false,
        ignoreCase: true,
      },
    ],
    'no-console': ['warn', { allow: ['error'] }],
  },
};
