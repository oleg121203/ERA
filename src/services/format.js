import { readFile, writeFile } from 'fs/promises';
import { globby } from 'globby';
import path from 'path';
import logger from '../utils/logger.js';

import { formatCSS } from './formatters/css.js';
import { formatHTML } from './formatters/html.js';
import { formatPython } from './formatters/python.js';
import { formatShell } from './formatters/shell.js';
import { formatSQL } from './formatters/sql.js';
import { formatText } from './formatters/text.js';

const formatters = {
  '.py': formatPython,
  '.sh': formatShell,
  '.html': formatHTML,
  '.css': formatCSS,
  '.sql': formatSQL,
  '.txt': formatText,
  // Додайте інші розширення та відповідні форматтери
};

async function format(options) {
  try {
    const paths = Array.isArray(options.paths)
      ? options.paths
      : typeof options.paths === 'string'
        ? options.paths.split(',')
        : ['src/**/*.{js,json,md,py,css,html,sh,ts,tsx,sql,txt}'];

    logger.info('Форматирование файлов по путям:', paths);

    const files = await globby(paths);

    // Инициализация провайдера AI
    const provider = new DeepSeekProvider(process.env.DEEPSEEK_API_KEY || '');

    for (const file of files) {
      try {
        const ext = path.extname(file);
        const basename = path.basename(file);
        const formatter = formatters[ext] || formatters[basename] || formatters['.txt'];

        const content = await readFile(file, 'utf8');
        let formatted;

        if (formatter) {
          formatted = await formatter(content, file, provider);
        } else {
          // Якщо форматтер не знайдений, використовуємо AI для форматування
          formatted = await provider.analyze(content);
        }

        if (options.write || process.env.FORMAT_WRITE === 'true') {
          await writeFile(file, formatted);
          logger.success(`Обработан: ${file}`);
        }
      } catch (error) {
        logger.warn(`Пропущен ${file}: ${error.message}`);
        continue;
      }
    }
  } catch (error) {
    logger.error('Ошибка форматирования:', error);
    process.exitCode = 1;
  }
}

export default format; // Add default export
