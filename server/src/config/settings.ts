import { Logger } from '../utils/logger';

const logger = new Logger();

const settings = {
    port: process.env.PORT || 3000,
    wsPort: process.env.WS_PORT || 8080,
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info'
};

logger.info('Загружена конфигурация:', settings);

export default settings;