import { ESLint } from 'eslint';
import { globby } from 'globby';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';
import logger from '../utils/logger.js';
import { DeepSeekProvider } from './providers/deepseek.js';
import { GeminiProvider } from './providers/gemini.js';
import { MistralProvider } from './providers/mistral.js';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

export default async function analyze(options) {
  try {
    logger.info('Starting code analysis...');

    const eslint = new ESLint({
      fix: options.fix,
      cwd: projectRoot,
    });

    let provider = null;
    if (options.provider && options.provider !== 'none') {
      const providers = {
        gemini: GeminiProvider,
        deepseek: DeepSeekProvider,
        mistral: MistralProvider,
      };

      const Provider = providers[options.provider];
      if (!Provider) {
        throw new Error(`Unsupported provider: ${options.provider}`);
      }

      const apiKey = config.apiKeys[options.provider];
      if (!apiKey) {
        throw new Error(`${options.provider.toUpperCase()}_API_KEY not found in environment`);
      }

      provider = new Provider(apiKey);
      logger.success('AI provider initialized');
    }

    const paths = Array.isArray(options.paths)
      ? options.paths
      : typeof options.paths === 'string'
        ? options.paths.split(',')
        : ['src/**/*.{js,json,md,py,css,html,sh,ts,tsx,sql,txt}'];

    logger.info('Analyzing files by paths:', paths);

    const files = await globby(paths, { absolute: true });
    if (!files.length) {
      logger.warn('No files found for analysis');
      return { summary: { totalFiles: 0 }, quality: { errors: 0 } };
    }

    const results = await eslint.lintFiles(files);

    if (options.fix) {
      await ESLint.outputFixes(results);
    }

    const aiSuggestions = [];
    if (provider) {
      for (const file of files) {
        try {
          const ext = path.extname(file);
          const content = await readFile(file, 'utf8');
          const analysis = await provider.analyze(content);
          if (analysis) {
            aiSuggestions.push({ file, suggestions: analysis });
          }
        } catch (error) {
          logger.warn(`Skipped ${file}: ${error.message}`);
        }
      }
    }

    const stats = {
      files: files.length,
      errors: results.reduce((sum, r) => sum + r.errorCount, 0),
      warnings: results.reduce((sum, r) => sum + r.warningCount, 0),
      fixes: results.reduce((sum, r) => sum + r.fixableErrorCount + r.fixableWarningCount, 0),
    };

    return {
      summary: {
        totalFiles: stats.files,
      },
      quality: {
        errors: stats.errors,
        warnings: stats.warnings,
        fixableIssues: stats.fixes,
      },
      suggestions: aiSuggestions,
    };
  } catch (error) {
    logger.error('Analysis error:', error);
    process.exitCode = 1;
    throw error;
  }
}
