export default [
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        process: true,
        console: true,
        module: true,
        require: true,
        __dirname: true,
        __filename: true,
        Buffer: true,
        global: true
      }
    },
    plugins: {
      'prettier': require('eslint-plugin-prettier'),
    },
    env: {
      node: true,
      es6: true
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'off',
      'no-undef': 'error',
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }]
    }
  }
];