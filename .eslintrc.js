module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier' // Интеграция с Prettier
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es2021: true,
  },
  rules: {
    // Ваши правила ESLint
  },
};
