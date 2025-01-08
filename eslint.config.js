import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const compat = new FlatCompat({
  baseDirectory: import.meta.url,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'prettier/prettier': 'error',
    },
  },
  ...compat.config({
    extends: ['plugin:prettier/recommended'],
  }),
];
