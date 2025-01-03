module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    "no-console": 0,
    "eqeqeq": "warn",
    "no-cond-assign": 0,
    "no-unused-vars": 1,
    "no-extra-semi": "warn",
    "semi": "warn"
  },
};
