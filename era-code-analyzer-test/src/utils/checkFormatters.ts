import { execSync } from 'child_process';
import { logger } from './logger';

// Добавлен тип Formatter
type Formatter = 'prettier' | 'eslint' | 'black' | 'autopep8' | 'isort';

export function checkFormatters() {
  // Изменено: Добавлен тип Record<Formatter, boolean>
  const formatters: Record<Formatter, boolean> = {
    prettier: false,
    eslint: false,
    black: false,
    autopep8: false,
    isort: false
  };

  const checks = [
    { name: 'prettier', cmd: 'npx prettier -v' },
    { name: 'eslint', cmd: 'npx eslint -v' },
    { name: 'black', cmd: 'black --version' },
    { name: 'autopep8', cmd: 'autopep8 --version' },
    { name: 'isort', cmd: 'isort --version' }
  ];

  checks.forEach(({ name, cmd }) => {
    try {
      execSync(cmd);
      formatters[name as Formatter] = true; // Добавлено приведение типа
      logger.info(`✓ ${name} установлен`);
    } catch {
      logger.warn(`✗ ${name} не установлен`);
    }
  });

  return formatters;
}