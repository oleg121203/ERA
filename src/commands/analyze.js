import dotenv from 'dotenv';
import { ESLint } from 'eslint';
import { globby } from 'globby';
import { readFile } from 'node:fs/promises'; // Исправляем импорт
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { DeepSeekProvider } from '../services/providers/deepseek.js';
import { GeminiProvider } from '../services/providers/gemini.js';
import { MistralProvider } from '../services/providers/mistral.js'; // Добавляем импорт Mistral
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// Загружаем переменные окружения
dotenv.config({ path: path.resolve(projectRoot, '.env') });

export default async function analyze(options) {
  try {
    logger.info('Запуск анализа кода...');

    const eslint = new ESLint({
      fix: options.fix,
      cwd: projectRoot,
      baseConfig: {
        extends: ['eslint:recommended'],
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
    });

    // Объявляем provider в начале функции
    let provider = null;

    // Обновляем проверку провайдеров
    if (options.provider === 'gemini') {
      logger.info('Инициализация AI провайдера...');
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        logger.error('GEMINI_API_KEY не найден в переменных окружения');
        return;
      }
      try {
        provider = new GeminiProvider(apiKey);
        logger.success('AI провайдер успешно инициализирован');
      } catch (error) {
        logger.error('Ошибка инициализации AI провайдера:', error);
        return;
      }
    } else if (options.provider === 'deepseek') {
      logger.info('Инициализация DeepSeek провайдера...');
      const apiKey = process.env.DeepSeek_API_SECRET || process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        logger.error('DeepSeek API ключ не найден в переменных окружения');
        return;
      }
      try {
        provider = new DeepSeekProvider(apiKey);
        logger.success('DeepSeek провайдер успешно инициализирован');
      } catch (error) {
        logger.error('Ошибка инициализации DeepSeek провайдера:', error);
        return;
      }
    } else if (options.provider === 'mistral') {
      logger.info('Инициализация Mistral провайдера...');
      const apiKey = process.env.MISTRAL_API_KEY;
      if (!apiKey) {
        logger.error('MISTRAL_API_KEY не найден в переменных окружения');
        return;
      }
      try {
        provider = new MistralProvider(apiKey);
        logger.success('Mistral провайдер успешно инициализирован');
      } catch (error) {
        logger.error('Ошибка инициализации Mistral провайдера:', error);
        return;
      }
    }

    // Безопасное получение путей с учетом корневой директории
    const filePaths =
      options.paths && options.paths.length
        ? options.paths.map((p) => path.resolve(projectRoot, p))
        : [path.resolve(projectRoot, 'src')];

    // Формируем паттерны для поиска файлов с абсолютными путями
    const patterns = options.paths.map((p) => {
      if (p.includes('.devcontainer')) {
        return `${p}/**/*.{json,jsonc,sh,Dockerfile}`;
      }
      if (p.endsWith('.sh')) return p;
      if (p.endsWith('.txt')) return p;
      return `${p}/**/*.{js,json,md}`;
    });

    logger.info('Анализируемые паттерны:', patterns);

    // Загружаем содержимое файлов
    const globOptions = {
      absolute: true,
      cwd: projectRoot,
    };

    const files = await globby(patterns, globOptions);
    const fileContents = await Promise.all(
      files.map(async (file) => ({
        path: file,
        content: await readFile(file, 'utf-8'),
      }))
    );

    // ESLint анализ
    const results = await eslint.lintFiles(files);

    if (results.length === 0) {
      logger.warn('Не найдено файлов для анализа');
      return;
    }

    // Собираем статистику по файлам
    const fileStats = fileContents.map((file) => {
      const result = results.find((r) => r.filePath === file.path);
      return {
        path: path.relative(projectRoot, file.path),
        lines: file.content.split('\n').length,
        content: file.content,
        errors: result?.errorCount || 0,
        warnings: result?.warningCount || 0,
        fixable: (result?.fixableErrorCount || 0) + (result?.fixableWarningCount || 0),
      };
    });

    // Общая статистика
    const stats = fileStats.reduce(
      (acc, file) => ({
        files: acc.files + 1,
        lines: acc.lines + file.lines,
        errors: acc.errors + file.errors,
        warnings: acc.warnings + file.warnings,
        fixable: acc.fixable + file.fixable,
      }),
      { files: 0, lines: 0, errors: 0, warnings: 0, fixable: 0 }
    );

    logger.info('\nПроанализированные файлы:');
    fileStats.forEach((file) => {
      logger.info(`- ${file.path} (${file.lines} строк)`);
    });

    // Обновляем логику AI анализа
    if (provider) {
      logger.info('\nЗапуск AI анализа...');
      let analyzedFiles = 0;
      let failedAttempts = 0;

      for (const stat of fileStats) {
        analyzedFiles++;
        logger.info(`Анализ файла (${analyzedFiles}/${files.length}): ${stat.path}`);
        try {
          const eslintResult = results.find((r) => r.filePath.endsWith(stat.path));
          const prompt = [
            '# Code Analysis Request',
            `## File: ${stat.path}`,
            '## Code:',
            stat.content,
            '## Current Issues:',
            eslintResult?.messages?.length
              ? JSON.stringify(eslintResult.messages, null, 2)
              : 'No ESLint issues found',
            '## Analysis Instructions:',
            '1. Code Structure Review:',
            '   - Evaluate overall code organization',
            '   - Check function and variable naming',
            '   - Assess code modularity',
            '2. Best Practices Check:',
            '   - Identify potential performance issues',
            '   - Suggest code improvements',
            '   - Check error handling',
            '3. Security Analysis:',
            '   - Look for security vulnerabilities',
            '   - Check for sensitive data exposure',
            '4. Improvement Suggestions:',
            '   - Provide specific recommendations',
            '   - Suggest alternative approaches',
          ].join('\n');

          logger.info('Ожидание ответа от AI...');
          const aiAnalysis = await provider.analyze(prompt);

          if (aiAnalysis) {
            logger.success(`\nУспешный анализ файла: ${stat.path}`);
            console.log('-'.repeat(100));
            console.log(aiAnalysis.trim());
            console.log('-'.repeat(100));
          }

          // Сбрасываем счетчик ошибок при успешном анализе
          failedAttempts = 0;
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          logger.error(`Ошибка AI анализа для ${stat.path}:`, error);
          failedAttempts++;

          // Если 3 ошибки подряд - прекращаем AI анализ
          if (failedAttempts >= 3) {
            logger.error('Слишком много ошибок AI анализа подряд, продолжаем без AI');
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }
      }

      logger.success(`\nАнализ завершен. Обработано файлов: ${analyzedFiles}`);
    }

    if (options.fix && stats.fixable > 0) {
      logger.info('Применение автоматических исправлений...');
      await ESLint.outputFixes(results);
    }

    const formatter = await eslint.loadFormatter('stylish');
    logger.info('\nРезультаты анализа:');
    console.log(formatter.format(results));

    logger.info('\nСтатистика анализа:');
    logger.info(`- Всего файлов: ${stats.files}`);
    logger.info(`- Всего строк кода: ${stats.lines}`);
    logger.info(`- Ошибок: ${stats.errors}`);
    logger.info(`- Предупреждений: ${stats.warnings}`);
    logger.info(`- Исправимых проблем: ${stats.fixable}`);

    if (stats.errors === 0 && stats.warnings === 0) {
      logger.success('\n✓ Код соответствует всем правилам');
    }
  } catch (error) {
    if (error.messageTemplate === 'all-matched-files-ignored') {
      logger.warn(`Пропущены игнорируемые файлы в ${error.messageData.pattern}`);
      return;
    }
    logger.error('Ошибка анализа:', error);
    process.exit(1);
  }
}
