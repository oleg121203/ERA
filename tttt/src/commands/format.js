import { readFile, writeFile } from 'fs/promises';
import { globby } from 'globby'; // Заменяем glob на globby
import path from 'path';
import prettier from 'prettier';
import { DeepSeekProvider } from '../services/providers/deepseek.js'; // Импортируем инстанс провайдера логгера (уже инициализирован в другом месте)
import { logger } from 'tttt-logger';

const formatters = {
  '.json': async (content, filepath) => {
    return prettier.format(content, { parser: 'json', filepath });
  },
  '.jsonc': async (content, filepath) => {
    return prettier.format(content, { parser: 'json', filepath });
  },
  '.sh': async (content, filepath, provider) => {
    // Используем AI для форматирования shell скриптов
    logger.info(`AI-форматирование для shell-файла: ${filepath}`);
    const prompt = `Форматируй следующий shell-скрипт:\n\n${content}`;
    const aiFormatted = await provider.analyze(prompt);
    return aiFormatted || content;
  },
  '.txt': async (content) => {
    // Для txt файлов просто возвращаем контент
    return content;
  },
  Dockerfile: async (content, filepath, provider) => {
    // Используем AI для форматирования Dockerfile
    logger.info(`AI-форматирование для Dockerfile: ${filepath}`);
    const prompt = `Форматируй следующий Dockerfile:\n\n${content}`;
    const aiFormatted = await provider.analyze(prompt);
    return aiFormatted || content;
  },
};

export default async function format(options) {
  try {
    const paths = Array.isArray(options.paths)
      ? options.paths
      : typeof options.paths === 'string'
        ? options.paths.split(',')
        : ['src/**/*.{js,json,md,py,css,html,sh,ts,tsx}'];

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
        const formatted = await formatter(content, file, provider);

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
