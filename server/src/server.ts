/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import https from 'https';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import settings from './config/settings';
import { Logger } from './utils/logger';
import { execSync } from 'child_process';

const logger = new Logger();

// Constants
const PORT = 3000;
const REMOTE_PORT = 4000;
const HOST = '0.0.0.0';
const INSTALL_DEPENDENCIES = true;

// Добавляем конфигурацию SSL
const SSL_CONFIG = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'))
};

// Проверка и установка зависимостей
const checkAndInstallDeps = async (): Promise<void> => {
    if (!INSTALL_DEPENDENCIES) {
        logger.info('Пропуск проверки зависимостей...');
        return;
    }

    try {
        // Используем import вместо require
        await import('cors');
        await import('helmet');
        await import('express-rate-limit');
        await import('hpp');
        logger.info('Зависимости уже установлены');
    } catch (err) {
        logger.info('Установка необходимых пакетов...');
        try {
            execSync('yarn add cors helmet express-rate-limit hpp');
            logger.info('Пакеты успешно установлены');
        } catch (error) {
            logger.error('Ошибка установки:', error);
            throw error;
        }
    }
};

// Запуск серверов
const startServer = (): void => {
    const app = express();
    const remoteApp = express();
    const wss = new WebSocketServer({ port: settings.wsPort });

    try {
        // Базовая защита
        remoteApp.use(helmet());
        remoteApp.use(cors());
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 минут
            max: 100 // лимит запросов
        });
        remoteApp.use(limiter);
        
        // Защита от HTTP Parameter Pollution
        remoteApp.use(hpp());
        
        // Лимит размера JSON
        remoteApp.use(express.json({ limit: '10kb' }));
        
        // Защита от больших полезных нагрузок
        remoteApp.use(express.urlencoded({ extended: true, limit: '10kb' }));

    } catch (err) {
        logger.info('Запуск без middleware безопасности');
    }

    // Обслуживание статических файлов из директории snake_js
    app.use(express.static(path.join(__dirname, 'snake_js')));

    // Локальный сервер на 3000
    app.get('/', (req, res) => {
        res.send('Hello remote world!\n');
    });

    // Удаленный сервер на 4000
    remoteApp.get('/', (req, res) => {
        res.send('Привет с защищенного удаленного сервера!\n');
    });

    // Обработка ошибок
    remoteApp.use((err: Error, req: express.Request, res: express.Response): void => {
        logger.error(err.message);
        res.status(500).send('Internal Server Error');
    });

    // Запуск обоих серверов
    app.listen(PORT, HOST);
    logger.info(`Локальный HTTP сервер запущен на http://${HOST}:${PORT}`);

    https.createServer(SSL_CONFIG, remoteApp).listen(REMOTE_PORT, HOST);
    logger.info(`Защищенный удаленный HTTPS сервер запущен на https://${HOST}:${REMOTE_PORT}`);

    wss.on('connection', (ws: WebSocket) => {
        handleConnection(ws);
    });

    app.listen(settings.port, () => {
        logger.info(`Server running on port ${settings.port}`);
    });
};

const handleConnection = (ws: WebSocket): void => {
    logger.info('New connection established');
    ws.on('message', (): void => {
        // Пустой обработчик, если сообщения не используются
    });
};

// Запуск приложения
checkAndInstallDeps()
    .then(() => startServer())
    .catch(err => logger.error('Ошибка запуска сервера:', err));