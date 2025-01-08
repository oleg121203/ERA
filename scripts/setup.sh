#!/bin/bash

# Функция создания файла если он не существует или force=true
create_config_file() {
    local file=$1
    local force=$2
    local content=$3
    
    if [ ! -f "$file" ] || [ "$force" = true ]; then
        echo "$content" > "$file"
        echo "✓ Создан файл: $file"
    else
        echo "⏺ Пропущен существующий файл: $file"
    fi
}

# Получаем параметр force из аргументов
force=${1:-false}

# Создаем конфигурационные файлы
create_config_file ".prettierrc" "$force" '{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxBracketSameLine": false
}'

create_config_file "jest.config.js" "$force" 'module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/era-code-analyzer-test/src/utils/__tests__/setup.js"],
  testMatch: ["**/__tests__/**/*.test.js", "**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};'

create_config_file "eslint.config.js" "$force" 'import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const compat = new FlatCompat({
  baseDirectory: import.meta.url,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        process: "readonly",
        module: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "prettier/prettier": "error",
    },
  },
  ...compat.config({
    extends: ["plugin:prettier/recommended"],
  }),
];'

# Создаем структуру проекта если force=true или директории не существуют
if [ "$force" = true ] || [ ! -d "src" ]; then
    mkdir -p src/{controllers,models,routes,services,utils,config,tests}
    mkdir -p client/src/{components,pages,assets,styles,utils,tests}
    mkdir -p docs scripts docker .requirements
    echo "✓ Создана структура проекта"
else
    echo "⏺ Структура проекта уже существует"
fi

# Установка зависимостей
npm install

# Инициализация Git hooks
if [ "$force" = true ] || [ ! -f ".git/hooks/pre-commit" ]; then
    mkdir -p .git/hooks
    echo '#!/bin/sh
npm run lint-staged' > .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo "✓ Git hooks установлены"
else
    echo "⏺ Git hooks уже настроены"
fi

echo "✓ Настройка проекта завершена"