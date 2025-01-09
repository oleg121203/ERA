import logger from '../utils/logger.js';
import analyze from './analyze.js';
import format from './format.js'; // Now this import will work

export async function runCodeChecks(options) {
  try {
    logger.info('Запуск полной проверки кода...');

    logger.info('\n1. Форматирование кода:');
    await format({ write: true });

    logger.info('\n2. Анализ кода с AI:');
    await analyze({
      fix: options.fix,
      recursive: true,
      paths: ['src'],
      provider: options.provider || 'mistral',
    });

    logger.success('\n✓ Проверка кода успешно завершена');
  } catch (error) {
    logger.error('Ошибка при проверке кода:', error);
    process.exit(1);
  }
}
