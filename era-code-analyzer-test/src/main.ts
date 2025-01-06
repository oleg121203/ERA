import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { logger } from './utils/logger';
import { DEFAULT_OPTIONS } from './core/constants';
import { CodeAnalyzer } from './core/analyzer';
import { AnalysisOptions } from './core/types';
import { checkFormatters } from './utils/checkFormatters';
import apiRoutes from './api/routes'; // Добавлено

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', apiRoutes); // Изменено

// Serve React app
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Application error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// В начале работы сервера
const formattersStatus = checkFormatters();
logger.info('Статус форматтеров:', formattersStatus);

// Start server
app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
}).on('error', (err: Error) => {
    logger.error('Server failed to start:', err);
    process.exit(1);
});

// Handle uncaught errors
process.on('unhandledRejection', (err: Error) => {
    logger.error('Unhandled Rejection:', err);
    process.exit(1);
});


process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});