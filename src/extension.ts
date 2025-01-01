import * as vscode from 'vscode';

let autoLockTimeout: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('era.toggleReadonly', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const config = vscode.workspace.getConfiguration('era');
        const currentReadonly = editor.options.readOnly || false;
        
        // Переключаем режим readonly
        editor.options = { ...editor.options, readOnly: !currentReadonly };
        
        // Если включен режим редактирования, запускаем таймер
        if (!currentReadonly) {
            if (autoLockTimeout) {
                clearTimeout(autoLockTimeout);
            }
            
            const delay = config.get('autoLockDelay', 10000);
            autoLockTimeout = setTimeout(() => {
                editor.options = { ...editor.options, readOnly: true };
                vscode.window.showInformationMessage('Readonly mode enabled automatically');
            }, delay);
        }

        vscode.window.showInformationMessage(
            `Readonly mode ${!currentReadonly ? 'disabled' : 'enabled'}`
        );
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    if (autoLockTimeout) {
        clearTimeout(autoLockTimeout);
    }
}
