import { workspace, Uri } from 'vscode';

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
    } catch (err) {
        console.error('Error setting readonly:', err);
        throw err;
    }
}
