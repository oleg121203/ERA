const fs = require('fs');
const path = require('path');
const axios = require('axios');

const logDirectory = path.resolve(__dirname, '../log');
const logFile = path.join(logDirectory, 'app.log');
let additionalLogFile = null;

let errors = [];
let fixes = [];
let breakpoints = [];

try {
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true });
    }
} catch (dirError) {
    console.error("Не удалось создать директорию для логов:", dirError);
}

function log(message) {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] ${message}`;
    console.log(fullMessage);
    if (message.includes("breakpoint")) {
        console.log(`[BREAKPOINT LOG]: ${message}`);
    }
    if (message.includes("imports")) {
        console.log(`[IMPORTS LOG]: ${message}`);
    }
    try {
        fs.appendFileSync(logFile, fullMessage + "\n");
        if (additionalLogFile) {
            fs.appendFileSync(additionalLogFile, fullMessage + "\n");
        }
    } catch (writeError) {
        console.error(`Не удалось записать лог: ${writeError.message}. Метод: fs.appendFileSync. Файл: ${logFile}`);
    }
}

function error(message) {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] ERROR: ${message}`;
    console.error(fullMessage);
    errors.push({ timestamp, message });
    try {
        fs.appendFileSync(logFile, fullMessage + "\n");
        if (additionalLogFile) {
            fs.appendFileSync(additionalLogFile, fullMessage + "\n");
        }
    } catch (writeError) {
        console.error(`Не удалось записать лог (ERROR): ${writeError.message}. Метод: fs.appendFileSync. Файл: ${logFile}`);
    }
}

function logBreakpoint(message) {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] BREAKPOINT: ${message}`;
    console.log(fullMessage);
    try {
        fs.appendFileSync(logFile, fullMessage + "\n");
        if (additionalLogFile) {
            fs.appendFileSync(additionalLogFile, fullMessage + "\n");
        }
    } catch (writeError) {
        console.error(`Не удалось записать BREAKPOINT лог: ${writeError.message}. Метод: fs.appendFileSync. Файл: ${logFile}`);
    }
}

function setAdditionalLogFile(filename) {
    const extraPath = path.join(logDirectory, filename);
    additionalLogFile = extraPath;
    console.log(`Будем также писать логи в: ${extraPath}`);
}

function generateSummaryReport() {
    const timestamp = new Date().toISOString();
    const summary = {
        timestamp,
        errors: errors.map(error => ({
            ...error,
            reason: "Ошибка не была исправлена из-за недостаточного уровня confidence или других причин."
        })),
        fixes: fixes.map(fix => ({
            ...fix,
            fix: "Исправлено с помощью eslint."
        })),
        breakpoints: breakpoints,
        unresolvedErrors: errors.length - fixes.length,
        reasons: errors.length === fixes.length ? [] : errors.map(error => {
            return {
                error,
                reason: "Ошибка не была исправлена из-за недостаточного уровня confidence или других причин."
            };
        })
    };
    const summaryMessage = `[${timestamp}] Итоговый отчет:\n${JSON.stringify(summary, null, 2)}`;
    console.log(summaryMessage);
    try {
        fs.appendFileSync(logFile, summaryMessage + "\n");
        if (additionalLogFile) {
            fs.appendFileSync(additionalLogFile, summaryMessage + "\n");
        }
    } catch (writeError) {
        console.error(`Не удалось записать итоговый отчет: ${writeError.message}. Метод: fs.appendFileSync. Файл: ${logFile}`);
    }
    if (errors.length === 0) {
        console.log(`[${timestamp}] Итоговый отчет: Ошибок не обнаружено.`);
    }
}

function logAxiosRequest(url, options) {
    axios.post('https://logserver.example.com/logs', {
        url,
        options,
        timestamp: new Date().toISOString()
    })
    .then(response => {
        console.log('Логирование запроса прошло успешно');
    })
    .catch(error => {
        console.error('Ошибка при логировании запроса:', error);
    });
}

process.on('exit', generateSummaryReport);

module.exports = { log, error, setAdditionalLogFile, generateSummaryReport, logBreakpoint, logAxiosRequest };