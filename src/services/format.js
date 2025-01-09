import { readFile, writeFile } from 'fs/promises';
import { globby } from 'globby';
import path from 'path';
import prettier from 'prettier';
import config from '../config.js';
import logger from '../utils/logger.js';

const formatters = {
  '.js': async (content, filepath) => {
    return prettier.format(content, {
      parser: 'babel',
      filepath,
      singleQuote: true,
      trailingComma: 'es5',
    });
  },
  '.json': async (content, filepath) => {
    return prettier.format(content, { parser: 'json', filepath });
  },
  '.md': async (content, filepath) => {
    return prettier.format(content, { parser: 'markdown', filepath });
  },
};

export default async function format(options) {
  try {
    const paths = Array.isArray(options.paths)
      ? options.paths
      : typeof options.paths === 'string'
        ? options.paths.split(',')
        : [config.paths.src];

    logger.info('Formatting files in paths:', paths);

    const files = await globby(paths);

    for (const file of files) {
      try {
        const ext = path.extname(file);
        const formatter = formatters[ext];

        if (!formatter) {
          logger.warn(`No formatter found for ${file}, skipping...`); // Fixed syntax
          continue;
        }

        const content = await readFile(file, 'utf8');
        const formatted = await formatter(content, file);

        if (options.write) {
          await writeFile(file, formatted);
          logger.success(`Formatted: ${file}`);
        }
      } catch (error) {
        logger.warn(`Failed to format ${file}: ${error.message}`);
        continue;
      }
    }

    logger.success('Format complete');
  } catch (error) {
    logger.error('Format error:', error);
    throw error;
  }
}
