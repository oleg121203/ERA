import dotenv from 'dotenv';
import { ESLint } from 'eslint';
import { globby } from 'globby';
import { readFile, stat } from 'node:fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { DeepSeekProvider } from '../services/providers/deepseek.js';
import { GeminiProvider } from '../services/providers/gemini.js';
import { MistralProvider } from '../services/providers/mistral.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

dotenv.config({ path: path.resolve(projectRoot, '.env') });

export default async function analyze(options) {
  try {
    logger.info('Starting code analysis...');

    const eslint = new ESLint({
      fix: options.fix,
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
        if (fileStat.isDirectory()) {
          patterns.push(options.recursive ? path.join(filePath, '**/*') : path.join(filePath, '*'));
        } else if (fileStat.isFile()) {
          patterns.push(filePath);
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

          logger.info('Waiting for AI response...');
          const aiAnalysis = await provider.analyze(prompt);

          if (aiAnalysis) {
            logger.success(`\nSuccessfully analyzed file: ${stat.path}`);
            console.log('-'.repeat(100));
            console.log(aiAnalysis.trim());
            console.log('-'.repeat(100));
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

    if (options.fix && stats.fixable > 0) {
      logger.info('Applying automatic fixes...');
      await ESLint.outputFixes(results);
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
  } catch (error) {
    if (error.messageTemplate === 'all-matched-files-ignored') {
      logger.warn(`Skipped ignored files in ${error.messageData.pattern}`);
      return;
    }
    logger.error('Analysis error:', error);
    process.exit(1);
  }
}
