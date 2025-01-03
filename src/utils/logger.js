
const fs = require('fs');
const path = require('path');

const logDirectory = path.resolve(__dirname, '../log');
const logFile = path.join(logDirectory, 'app.log');

// Убедимся, что директория для логов существует
if (!fs.existsSync(logDirectory)){
    fs.mkdirSync(logDirectory, { recursive: true });
}

function log(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

function error(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ERROR: ${message}\n`);
}

module.exports = { log, error };