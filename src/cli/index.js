#!/usr/bin/env node
import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import Environment from '../utils/environment.js';
import analyze from '../commands/analyze.js';
import format from '../commands/format.js';
import fix from '../commands/fix.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../../');

// Принудительная инициализация окружения перед запуском
async function initEnvironment() {
  const env = new Environment(projectRoot);
  const isActive = await env.isActive();

  if (!isActive) {
    logger.warn('Окружение не активировано, выполняем активацию...');
    await env.activate();
    // Перезагружаем переменные окружения после активации
    dotenv.config({ path: resolve(projectRoot, '.env'), override: true });
  }
  return env;
}

async function main() {
  try {
    // Инициализируем окружение до запуска команд
    await initEnvironment();

    const program = new Command();

    program
      .version('1.0.0')
      .description('ERA CLI инструменты');

    program
      .command('analyze')
      .description('Анализ кода')
      .option('-f, --fix', 'Автоисправление')
      .option('-r, --recursive', 'Рекурсивный анализ')
      .option('-p, --provider <provider>', 'AI провайдер (none, gemini, deepseek)', 'none')
      .action(analyze);

    program
      .command('format')
      .description('Форматирование')
      .option('-w, --write', 'Сохранить изменения')
      .action(format);

    program
      .command('fix')
      .description('Исправить всё')
      .action(fix);

    program.parse(process.argv);
  } catch (error) {
    logger.error('Ошибка инициализации:', error);
    process.exit(1);
  }
}

main().catch(error => {
  logger.error('Критическая ошибка:', error);
  process.exit(1);
});
