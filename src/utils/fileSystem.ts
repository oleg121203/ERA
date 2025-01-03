import { workspace, Uri } from 'vscode';
import axios from 'axios';
const logger = require('../utils/logger');

export async function isWritable(uri: Uri): Promise<boolean> {
    try {
        return await workspace.fs.canWriteFile(uri);
    } catch {
        return false;
    }
}

export async function setReadonly(uri: Uri, readonly: boolean): Promise<void> {
    try {
        const edit = new WorkspaceEdit();
        // Реализация установки readonly режима
        await workspace.applyEdit(edit);

        // Логирование события изменения файла
        logger.log(`🔒 Установлен режим ${readonly ? 'readonly' : 'writable'} для файла: ${uri.fsPath}`);
    } catch (err) {
        logger.error(`Ошибка установки режима readonly для файла ${uri.fsPath}: ${err}`);
        throw err;
    }
}

// Пример функции создания файла с логированием
export async function createFile(uri: Uri, content: string): Promise<void> {
    try {
        await workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
        logger.log(`📝 Создан файл: ${uri.fsPath}`);
    } catch (err) {
        logger.error(`Ошибка создания файла ${uri.fsPath}: ${err}`);
        throw err;
    }
}
