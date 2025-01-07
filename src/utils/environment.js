import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import logger from './logger.js';

class Environment {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.envPath = path.join(rootPath, '.env');
    this.requiredVars = ['NODE_ENV', 'GEMINI_API_KEY'];
    this.defaultValues = {
      NODE_ENV: 'development',
      GEMINI_API_KEY: 'AIzaSyCDXOtzi7lrTIv8307xNUgGrFd16NFy8zg'
    };
  }

  async isActive() {
    try {
      const exists = await fs.access(this.envPath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        logger.warn('Файл .env не найден');
        return false;
      }

      dotenv.config({ path: this.envPath });
      return this.requiredVars.every(key => !!process.env[key]);
    } catch (error) {
      logger.error('Ошибка проверки окружения:', error);
      return false;
    }
  }

  async activate() {
    try {
      const content = this.requiredVars
        .map(key => `${key}=${process.env[key] || this.defaultValues[key] || ''}`)
        .join('\n');

      await fs.writeFile(this.envPath, content);
      const result = dotenv.config({ path: this.envPath, override: true });
      
      if (result.error) {
        throw new Error('Ошибка загрузки .env файла');
      }

      logger.success('Окружение активировано');
      logger.info('Созданные переменные окружения:');
      this.requiredVars.forEach(key => {
        logger.info(`${key}=${process.env[key]}`);
      });
    } catch (error) {
      logger.error('Ошибка активации окружения:', error);
      throw error;
    }
  }
}

export default Environment;
