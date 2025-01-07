export default [
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      'prettier': require('eslint-plugin-prettier'),
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'warn',
      'eqeqeq': 'error',
      'no-unused-vars': 'warn',
      'no-duplicate-imports': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
    },
  },
];