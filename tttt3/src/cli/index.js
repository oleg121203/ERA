#!/usr/bin/env node
import { Command } from 'commander';
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import analyze from '../commands/analyze.js';
import fix from '../commands/fix.js';
import format from '../commands/format.js';
import Environment from '../utils/environment.js';
import logger from '../utils/logger.js';
import { generateAnalysisReport } from '../utils/metrics-collector.js';

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

    program.version('1.0.0').description('ERA CLI инструменты');

    program
      .command('analyze')
      .description('Анализ кода')
      .option('-f, --fix', 'Автоисправление')
      .option('-r, --recursive', 'Рекурсивный анализ')
      .option('-p, --provider <provider>', 'AI провайдер (none, gemini, deepseek, mistral)', 'none')
      .action(analyze);

    program
      .command('format')
      .description('Форматирование')
      .option('-w, --write', 'Сохранить изменения')
      .option('-p, --paths <paths>', 'Пути для форматирования, разделенные запятыми')
      .action(format);

    program.command('fix').description('Исправить всё').action(fix);

    program
      .command('analyze-format')
      .description('Анализ и форматирование кода')
      .option('-f, --fix', 'Интерактивное исправление')
      .option('--auto-fix', 'Автоматическое применение всех исправлений')
      .option('-r, --recursive', 'Рекурсивный анализ')
      .option('-p, --provider <provider>', 'AI провайдер')
      .option('--paths <paths>', 'Пути для анализа и форматирования', (val) => val.split(','))
      .option('--delay <delay>', 'Задержка в мс', parseInt)
      .action(async (options) => {
        try {
          await analyze({
            ...options,
            autoFix: options.autoFix,
            fix: options.fix || options.autoFix,
          });
        } catch (error) {
          logger.error('Ошибка при выполнении analyze-format:', error);
          process.exit(1);
        }
      });

    program
      .command('report')
      .description('Генерация отчета по анализу кода')
      .option('-o, --output <path>', 'Путь для сохранения отчета')
      .option('-f, --format <format>', 'Формат отчета (text/json)')
      .action(async (options) => {
        try {
          const results = await analyze({ provider: 'none' });
          const report = generateAnalysisReport(results);
          logger.success('Отчет сгенерирован успешно');
          console.log(report);
        } catch (error) {
          logger.error('Ошибка при генерации отчета:', error);
          process.exit(1);
        }
      });

    program.parse(process.argv);
  } catch (error) {
    logger.error('Ошибка инициализации:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Критическая ошибка:', error);
  process.exit(1);
});
