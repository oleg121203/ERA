
import { checkFormatters } from './checkFormatters';
import { logger } from './logger';
import * as prettier from 'prettier';
import { ESLint } from 'eslint';
import { execSync } from 'child_process';

export async function formatFile(filePath: string, content: string) {
  const formatters = checkFormatters();
  logger.info('Применяются форматтеры:', formatters);

  let formatted = content;
  
  if (filePath.match(/\.(js|ts|jsx|tsx)$/)) {
    if (formatters.prettier) {
      formatted = await prettier.format(formatted, {
        filepath: filePath
      });
      logger.info(`Prettier применен к ${filePath}`);
    }
    
    if (formatters.eslint) {
      const eslint = new ESLint({fix: true});
      const results = await eslint.lintText(formatted);
      formatted = results[0].output || formatted;
      logger.info(`ESLint применен к ${filePath}`);
    }
  }
  
  if (filePath.endsWith('.py')) {
    if (formatters.black) {
      execSync(`black "${filePath}"`);
      logger.info(`Black применен к ${filePath}`);
    }
    
    if (formatters.isort) {
      execSync(`isort "${filePath}"`);
      logger.info(`ISort применен к ${filePath}`);
    }
    
    if (formatters.autopep8) {
      execSync(`autopep8 --in-place "${filePath}"`);
      logger.info(`AutoPEP8 применен к ${filePath}`);
    }
  }

  return formatted;
}