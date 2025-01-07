import prettier from 'prettier';
import { globby } from 'globby';  // Заменяем glob на globby
import { readFile, writeFile } from 'fs/promises';
import logger from '../utils/logger.js';

export default async function format(options) {
  try {
    const files = await globby('src/**/*.{js,json,md}');
    
    for (const file of files) {
      const content = await readFile(file, 'utf8');
      const formatted = await prettier.format(content, {
        filepath: file,
        parser: 'babel'  // добавляем явный парсер
      });
      
      if (options.write) {
        await writeFile(file, formatted);
        logger.success(`Отформатирован: ${file}`);
      } else {
        logger.info(formatted);
      }
    }
  } catch (error) {
    logger.error('Ошибка форматирования:', error);
    process.exit(1);
  }
}
