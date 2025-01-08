import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import logger from './logger.js';

class Environment {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.envPath = path.join(rootPath, '.env');
    this.requiredVars = ['NODE_ENV', 'GEMINI_API_KEY', 'MISTRAL_API_KEY']; // Добавлено "MISTRAL_API_KEY"
  }

  async isActive() {
    try {
      await fs.access(this.envPath);
      const env = dotenv.config({ path: this.envPath });
      return this.requiredVars.every((key) => !!process.env[key]);
    } catch (error) {
      return false;
    }
  }

  async activate() {
    try {
      const template = this.requiredVars
        .map((key) => `${key}=${process.env[key] || ''}`)
        .join('\n');

      await fs.writeFile(this.envPath, template);
      dotenv.config({ path: this.envPath });
      logger.success('Окружение активировано');

      const missing = this.requiredVars.filter((key) => !process.env[key]);
      if (missing.length > 0) {
        logger.warn(`Необходимо установить следующие переменные в .env:\n${missing.join('\n')}`);
      }
    } catch (error) {
      logger.error('Ошибка активации окружения:', error);
      throw error;
    }
  }
}

export default Environment;
