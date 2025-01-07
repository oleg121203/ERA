#!/usr/bin/env node
import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Environment from '../utils/environment.js';
import analyze from '../commands/analyze.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../../');

// Инициализация окружения
const env = new Environment(projectRoot);

async function main() {
  try {
    // Проверка окружения
    if (!await env.isActive()) {
      logger.warn('Окружение не активировано');
      await env.activate();
    }

    program
      .version('1.0.0')
      .description('ERA CLI для анализа и форматирования кода');

    program
      .command('analyze [paths...]')
      .description('Анализ кода')
      .option('-f, --fix', 'Автоматически исправить проблемы')
      .option('-r, --recursive', 'Рекурсивный анализ папки')
      .option('-p, --provider <provider>', 'AI провайдер (none или gemini)', 'none')
      .action((paths, options) => {
        options.paths = paths || [];
        analyze(options);
      });

    program.parse(process.argv);
  } catch (error) {
    logger.error('Ошибка инициализации:', error);
    process.exit(1);
  }
}

main();
