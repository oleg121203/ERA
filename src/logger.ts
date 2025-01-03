import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const transport = new transports.DailyRotateFile({
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',        // Максимальный размер файла 20 МБ
  maxFiles: '14d'        // Хранить логи за 14 дней
});

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [transport]
});

export default logger;
