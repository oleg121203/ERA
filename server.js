/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const helmet = require('helmet');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');

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
const checkAndInstallDeps = async () => {
    if (!INSTALL_DEPENDENCIES) {
        console.log('Пропуск проверки зависимостей...');
        return Promise.resolve();
    }

    try {
        require('cors');
        require('helmet');
        require('express-rate-limit');
        require('hpp');
        console.log('Зависимости уже установлены');
        return Promise.resolve();
    } catch (err) {
        console.log('Установка необходимых пакетов...');
        return new Promise((resolve, reject) => {
            require('child_process').exec('yarn add cors helmet express-rate-limit hpp', (error) => {
                if (error) {
                    console.error('Ошибка установки:', error);
                    reject(error);
                    return;
                }
                console.log('Пакеты успешно установлены');
                resolve();
            });
        });
    }
};

// Запуск серверов
const startServer = () => {
    const app = express();
    const remoteApp = express();

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
        console.log('Запуск без middleware безопасности');
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
    remoteApp.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Что-то пошло не так!');
    });

    // Запуск обоих серверов
    app.listen(PORT, HOST);
    console.log(`Локальный HTTP сервер запущен на http://${HOST}:${PORT}`);

    https.createServer(SSL_CONFIG, remoteApp).listen(REMOTE_PORT, HOST);
    console.log(`Защищенный удаленный HTTPS сервер запущен на https://${HOST}:${REMOTE_PORT}`);
};

// Запуск приложения
checkAndInstallDeps()
    .then(() => startServer())
    .catch(err => console.error('Ошибка запуска сервера:', err));