const fs = require('fs');
const path = require('path');

const logDirectory = path.resolve(__dirname, '../log');
const logFile = path.join(logDirectory, 'app.log');
let additionalLogFile = null;

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
    try {
        fs.appendFileSync(logFile, fullMessage + "\n");
        if (additionalLogFile) {
            fs.appendFileSync(additionalLogFile, fullMessage + "\n");
        }
    } catch (writeError) {
        console.error("Не удалось записать лог:", writeError);
    }
}

function error(message) {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] ERROR: ${message}`;
    console.error(fullMessage);
    try {
        fs.appendFileSync(logFile, fullMessage + "\n");
        if (additionalLogFile) {
            fs.appendFileSync(additionalLogFile, fullMessage + "\n");
        }
    } catch (writeError) {
        console.error("Не удалось записать лог (ERROR):", writeError);
    }
}

function setAdditionalLogFile(filename) {
    const extraPath = path.join(logDirectory, filename);
    additionalLogFile = extraPath;
    console.log(`Будем также писать логи в: ${extraPath}`);
}

module.exports = { log, error, setAdditionalLogFile };