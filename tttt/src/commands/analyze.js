import dotenv from 'dotenv';
import { ESLint } from 'eslint';
import { globby } from 'globby';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path, { dirname } from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { DeepSeekProvider } from '../services/providers/deepseek.js';
import { GeminiProvider } from '../services/providers/gemini.js';
import { MistralProvider } from '../services/providers/mistral.js';
import logger from '../utils/logger.js';
import { generateAnalysisReport } from '../utils/metrics-collector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

dotenv.config({ path: path.resolve(projectRoot, '.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

let fixesApplied = 0;
let filesChanged = 0;
let totalSuggestions = 0;

// Пример конфигурации для типов анализа
const defaultAnalysisConfig = {
  security: { confidence: 70, risk: 30, necessity: 80 },
  syntax: { confidence: 70, risk: 30, necessity: 80 },
  import: { confidence: 70, risk: 30, necessity: 80 },
  style: { confidence: 70, risk: 30, necessity: 80 },
  performance: { confidence: 70, risk: 30, necessity: 80 },
  // ...можно добавить другие типы анализа...
};

// Дефолтные промпты для каждого типа анализа
const defaultPrompts = {
  security: 'Проверка на уязвимости и безопасный код',
  syntax: 'Проверка синтаксиса и целостности',
  import: 'Анализ импортов и зависимостей',
  style: 'Проверка кодстайла',
  performance: 'Оптимизация производительности',
  // ...можно добавить другие...
};

// Функция для сборки кастомного или дефолтного промпта
function buildPrompt(filePath, fileContent, analysisType, userPrompts, eslintResult) {
  const currentPrompt = userPrompts?.[analysisType] || defaultPrompts[analysisType] || '';
  return [
    '# Code Analysis Request',
    `## File: ${filePath}`,
    `## Analysis type: ${analysisType}`,
    `## Prompt: ${currentPrompt}`,
    '## Code:',
    fileContent,
    '## Current Issues:',
    eslintResult?.messages?.length
      ? JSON.stringify(eslintResult.messages, null, 2)
      : 'No ESLint issues found',
    '## Analysis Instructions:',
    '1. Provide specific code changes in the following format:',
    '```suggestion',
    'old code',
    '```',
    '```fix',
    'new code',
    '```',
    '2. Each suggestion should include:',
    '   - Clear explanation of the change',
    '   - Code block with old and new code',
  ].join('\n');
}

// Функция проверки, удовлетворяют ли предложенные изменения нужным параметрам
function validateSuggestion(suggestion, analysisType, userConfig = {}) {
  const config = userConfig[analysisType] || defaultAnalysisConfig[analysisType];
  if (!config) return true; // Если нет конфигурации - пропускаем

  // "условные" значения для примера, реальная логика может быть иная
  const { confidence = 70, risk = 30, necessity = 80 } = config;

  // Допустим, suggestion содержит поля: suggestion.confidence, suggestion.risk, suggestion.necessity
  // Если хотя бы один из параметров не проходит установленный порог, не вносим изменения
  if (suggestion.confidence < confidence) return false;
  if (suggestion.risk > risk) return false;
  if (suggestion.necessity < necessity) return false;

  return true;
}

function buildAgentRequest(analysisType, fileContent) {
  return `Агентный запрос для типа анализа "${analysisType}":\n\n${fileContent}`;
}

function collectProjectStats(files) {
  const stats = {
    components: files.filter((f) => f.includes('/components/')).length,
    services: files.filter((f) => f.includes('/services/')).length,
    utils: files.filter((f) => f.includes('/utils/')).length,
    commands: files.filter((f) => f.includes('/commands/')).length,
  };
  return stats;
}

export default async function analyze(options) {
  try {
    logger.info('Starting code analysis...');

    const eslint = new ESLint({
      fix: options.fix || options.autoFix,
      cwd: projectRoot,
      baseConfig: {
        extends: ['eslint:recommended', 'plugin:import/errors', 'plugin:import/warnings'],
        plugins: ['import'],
        rules: {
          'import/no-unresolved': 'error',
          'import/named': 'error',
          'import/namespace': 'error',
          'import/default': 'error',
          'import/export': 'error',
          'import/no-restricted-paths': 'error',
          'import/no-absolute-path': 'error',
          'import/no-dynamic-require': 'error',
          'import/no-internal-modules': 'error',
          'import/no-webpack-loader-syntax': 'error',
          'import/no-self-import': 'error',
          'import/no-cycle': 'error',
          'import/no-useless-path-segments': 'error',
          'import/no-relative-packages': 'error',
          'import/no-relative-parent-imports': 'error',
          'import/no-extraneous-dependencies': 'error',
          'import/no-mutable-exports': 'error',
          'import/no-unused-modules': 'error',
          'import/unambiguous': 'error',
        },
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
    });

    let provider = null;

    if (options.provider === 'gemini') {
      logger.info('Initializing AI provider...');
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        logger.error('GEMINI_API_KEY not found in environment variables');
        return;
      }
      try {
        provider = new GeminiProvider(apiKey);
        logger.success('AI provider successfully initialized');
      } catch (error) {
        logger.error('Error initializing AI provider:', error);
        return;
      }
    } else if (options.provider === 'deepseek') {
      logger.info('Initializing DeepSeek provider...');
      const apiKey = process.env.DeepSeek_API_SECRET || process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        logger.error('DeepSeek API key not found in environment variables');
        return;
      }
      try {
        provider = new DeepSeekProvider(apiKey);
        logger.success('DeepSeek provider successfully initialized');
      } catch (error) {
        logger.error('Error initializing DeepSeek provider:', error);
        return;
      }
    } else if (options.provider === 'mistral') {
      logger.info('Initializing Mistral provider...');
      const apiKey = process.env.MISTRAL_API_KEY;
      if (!apiKey) {
        logger.error('MISTRAL_API_KEY not found in environment variables');
        return;
      }
      try {
        provider = new MistralProvider(apiKey);
        logger.success('Mistral provider successfully initialized');
      } catch (error) {
        logger.error('Error initializing Mistral provider:', error);
        return;
      }
    }

    const filePaths =
      options.paths && options.paths.length
        ? options.paths.map((p) => path.resolve(projectRoot, p))
        : [path.resolve(projectRoot, 'src')];

    const patterns = [];
    for (const filePath of filePaths) {
      try {
        const fileStat = await stat(filePath);
        if (fileStat.isFile()) {
          patterns.push(filePath);
        } else if (fileStat.isDirectory()) {
          patterns.push(options.recursive ? path.join(filePath, '**/*') : path.join(filePath, '*'));
        }
      } catch (error) {
        logger.warn(`Error processing path ${filePath}: ${error.message}`);
      }
    }

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

    const results = await eslint.lintFiles(files);
    if (results.length === 0) {
      logger.warn('No files found for analysis');
      return;
    }

    const fileStats = fileContents.map((file) => {
      const result = results.find((r) => r.filePath.endsWith(file.path));
      return {
        path: path.relative(projectRoot, file.path),
        lines: file.content.split('\n').length,
        content: file.content,
        errors: result?.errorCount || 0,
        warnings: result?.warningCount || 0,
        fixable: (result?.fixableErrorCount || 0) + (result?.fixableWarningCount || 0),
      };
    });
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

    logger.info('\nAnalyzed files:');
    fileStats.forEach((file) => {
      logger.info(`- ${file.path} (${file.lines} lines)`);
    });

    if (provider) {
      logger.info('\nStarting AI analysis...');
      let failedAttempts = 0;

      for (const stat of fileStats) {
        logger.info(
          `Analyzing file (${fileStats.indexOf(stat) + 1}/${fileStats.length}): ${stat.path}`
        );
        try {
          const eslintResult = results.find((r) => r.filePath.endsWith(stat.path));
          const analysisType = options.analysisType || 'import';
          const agentPrompt = buildAgentRequest(analysisType, stat.content);
          // При необходимости можно дополнительно использовать agentPrompt для агентирования модели

          const prompt = buildPrompt(
            stat.path,
            stat.content,
            analysisType,
            options.prompts,
            eslintResult
          );

          logger.info('Waiting for AI response...');
          const aiAnalysis = await provider.analyze(prompt);

          if (aiAnalysis) {
            // Извлекаем предложенные изменения
            const suggestions = extractSuggestions(aiAnalysis);

            if (suggestions.length > 0) {
              totalSuggestions += suggestions.length;
              let fileWasChanged = false;

              logger.info(`\nFound ${suggestions.length} suggestions for ${stat.path}`);

              let pendingCascadeSuggestions = [];

              for (const suggestion of suggestions) {
                console.log('\nПредлагаемое изменение:');
                console.log('-'.repeat(80));
                console.log(suggestion.explanation);
                console.log('Старый код:', suggestion.oldCode);
                console.log('Новый код:', suggestion.newCode);
                console.log('-'.repeat(80));

                // Определяем тип анализа "import", "syntax", "security" и т.д.
                const analysisType = 'import'; // пример, реальная логика может быть иной

                // Проверяем, удовлетворяет ли предложение заданным параметрам
                const isValid = validateSuggestion(
                  suggestion,
                  analysisType,
                  options.analysisConfig
                );
                if (!isValid) {
                  pendingCascadeSuggestions.push(suggestion);
                  continue;
                }

                if (options.fix) {
                  if (options.autoFix) {
                    const changed = await applyChange(stat.path, suggestion);
                    if (changed) fileWasChanged = true;
                    logger.success('Изменение применено автоматически');
                  } else {
                    const answer = await promptUser('Применить это изменение? (y/N): ');
                    if (answer.toLowerCase() === 'y') {
                      const changed = await applyChange(stat.path, suggestion);
                      if (changed) fileWasChanged = true;
                      logger.success('Изменение применено');
                    }
                  }
                }
              }

              // Предполагаем, что если есть каскадные изменения (pendingCascadeSuggestions) — спрашиваем у пользователя
              if (pendingCascadeSuggestions.length) {
                const answer = await promptUser(
                  'Есть зависимые изменения, применить их все сразу? (y/N): '
                );
                if (answer.toLowerCase() === 'y') {
                  // ...реализовать принятие или отклонение всех...
                }
              }

              if (fileWasChanged) filesChanged++;
            }
          }

          failedAttempts = 0;
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          logger.error(`AI analysis error for ${stat.path}:`, error);
          failedAttempts++;

          if (failedAttempts >= 3) {
            logger.error('Too many AI analysis errors in a row, continuing without AI');
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }
      }

      logger.success(`\nAnalysis completed. Processed files: ${fileStats.length}`);
    }

    if (options.autoFix) {
      logger.info('Applying all fixes automatically...');
      await ESLint.outputFixes(results);
      logger.success('All fixes applied');
    } else if (options.fix) {
      logger.info('Предлагаемые исправления:');
      for (const result of results) {
        if (result.output && result.output !== result.source) {
          console.log(`\nФайл: ${result.filePath}`);
          console.log('Изменения:');
          console.log(result.output);

          const answer = await promptUser('Применить исправления? (y/N): ');
          if (answer.toLowerCase() === 'y') {
            await ESLint.outputFixes([result]);
            logger.success('Исправления применены');
          }
        }
      }
    }

    const formatter = await eslint.loadFormatter('stylish');
    logger.info('\nAnalysis results:');
    console.log(formatter.format(results));

    logger.info('\nAnalysis statistics:');
    logger.info(`- Total files: ${stats.files}`);
    logger.info(`- Total lines of code: ${stats.lines}`);
    logger.info(`- Errors: ${stats.errors}`);
    logger.info(`- Warnings: ${stats.warnings}`);
    logger.info(`- Fixable issues: ${stats.fixable}`);

    if (stats.errors === 0 && stats.warnings === 0) {
      logger.success('\n✓ Code meets all rules');
    }

    logger.info(generateReport(fileStats));

    const projectStats = collectProjectStats(files);
    const totalLines = fileStats.reduce((acc, file) => acc + file.lines, 0);

    const analysisResults = {
      summary: {
        totalFiles: files.length,
        totalLines: totalLines,
        totalComponents: projectStats.components,
        totalServices: projectStats.services,
        totalUtils: projectStats.utils,
        totalCommands: projectStats.commands,
      },
      quality: {
        errors: stats.errors,
        warnings: stats.warnings,
        fixableIssues: stats.fixable,
        coverage: '0%',
        complexity: {
          high: fileStats.filter((f) => f.errors > 20).length,
          medium: fileStats.filter((f) => f.errors > 10 && f.errors <= 20).length,
          low: fileStats.filter((f) => f.errors <= 10).length,
        },
      },
      suggestions: {
        critical: [], // Добавьте реальные значения
        important: [], // Добавьте реальные значения
        minor: [], // Добавьте реальные значения
      },
      fixes: {
        applied: fixesApplied,
        pending: stats.fixable - fixesApplied,
        failed: 0,
      },
    };

    const report = generateAnalysisReport(analysisResults);
    logger.info(report);

    return analysisResults;
  } catch (error) {
    if (error.messageTemplate === 'all-matched-files-ignored') {
      logger.warn(`Skipped ignored files in ${error.messageData.pattern}`);
      return;
    }
    logger.error('Analysis error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

function generateReport(fileStats) {
  const report = [
    '\n=== Итоговый отчет ===',
    `Проанализировано файлов: ${fileStats.length}`,
    `Найдено предложений: ${totalSuggestions}`,
    `Применено исправлений: ${fixesApplied}`,
    `Изменено файлов: ${filesChanged}`,
    '\nДетали изменений:',
    '----------------',
  ];

  if (fixesApplied > 0) {
    report.push('✓ Успешно применены исправления');
  } else {
    report.push('ℹ Изменения не требовались');
  }

  return report.join('\n');
}

function extractSuggestions(aiAnalysis) {
  const suggestions = [];
  const regex = /```suggestion\n([\s\S]*?)```\n```fix\n([\s\S]*?)```/g;

  let match;
  while ((match = regex.exec(aiAnalysis)) !== null) {
    suggestions.push({
      oldCode: match[1].trim(),
      newCode: match[2].trim(),
      explanation: aiAnalysis.substring(0, match.index).split('\n').pop(),
    });
  }

  return suggestions;
}

async function applyChange(filePath, suggestion) {
  const content = await readFile(filePath, 'utf-8');
  const newContent = content.replace(suggestion.oldCode, suggestion.newCode);

  if (content !== newContent) {
    await writeFile(filePath, newContent);
    fixesApplied++;
    return true;
  }
  return false;
}

// Закрытие интерфейса readline при завершении процесса
process.on('exit', () => {
  rl.close();
});
