/* global process */
import { ESLint } from 'eslint';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import { GeminiProvider } from '../services/providers/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// Загружаем переменные окружения
dotenv.config({ path: path.resolve(projectRoot, '.env') });

export default async function analyze(options) {
  try {
    const eslint = new ESLint({
      useEslintrc: false,
      baseConfig: {
        extends: ['eslint:recommended'],
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module'
        }
      }
    });

    // Инициализация провайдера только если явно запрошен gemini
    let provider = null;
    if (options.provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        logger.error('GEMINI_API_KEY не найден в переменных окружения, продолжаем без AI анализа');
      } else {
        provider = new GeminiProvider(apiKey);
      }
    }

    // Безопасное получение путей с учетом корневой директории
    const filePaths = (options.paths && options.paths.length) 
      ? options.paths.map(p => path.resolve(projectRoot, p))
      : [path.resolve(projectRoot, 'src')];
    
    // Формируем паттерны для поиска файлов с абсолютными путями
    const patterns = filePaths.map(filePath => {
      if (options.recursive && !filePath.includes('*')) {
        return path.join(filePath, '**/*.{js,jsx,ts,tsx}');
      }
      return filePath;
    });

    logger.info('Анализируем файлы в:', patterns);
    const results = await eslint.lintFiles(patterns);
    
    // Используем AI анализ только если провайдер успешно инициализирован
    if (provider) {
      for (const result of results) {
        if (result.messages.length > 0) {
          const aiAnalysis = await provider.analyze(
            `Analyze this code:\n${result.source}\n\nESLint found these issues:\n${
              JSON.stringify(result.messages, null, 2)
            }`
          );
          logger.info(`\nAI Analysis for ${result.filePath}:\n${aiAnalysis}\n`);
        }
      }
    }

    if (options.fix) {
      await ESLint.outputFixes(results);
    }
    const formatter = await eslint.loadFormatter('stylish');
    logger.info(formatter.format(results));
  } catch (error) {
    logger.error('Ошибка анализа:', error);
    process.exit(1);
  }
}
