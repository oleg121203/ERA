import { 
    window,
    commands,
    workspace,
    WorkspaceEdit,
    ExtensionContext,
    TextEditor,
    Uri,
    Disposable
} from 'vscode';
import * as path from 'path';
import { ESLint } from 'eslint';
import * as prettier from 'prettier';

const eslintConfigPath = path.join(__dirname, '../config/.eslintrc.js');
const prettierConfigPath = path.join(__dirname, '../config/.prettierrc.js');

// Пример использования путей конфигурации
const eslint = new ESLint({ overrideConfigFile: eslintConfigPath });
const prettierOptions = require(prettierConfigPath);

let autoLockTimeout: NodeJS.Timeout | undefined;
let disposable: Disposable;

export async function activate(context: ExtensionContext) {
    disposable = commands.registerCommand('era.toggleReadonly', async () => {
        const editor = window.activeTextEditor;
        if (!editor) {
            window.showInformationMessage("No active text editor");
            return;
        }

        try {
            const uri = editor.document.uri;
            if (!workspace.fs.isFile(uri)) {
                window.showInformationMessage("Not a regular file");
                return;
            }

            const currentReadonly = await workspace.fs.canWriteFile(uri);
            const edit = new WorkspaceEdit();

            try {
                await workspace.applyEdit(edit);
                await window.showInformationMessage(
                    `File is now ${currentReadonly ? 'readonly' : 'writable'}`
                );
            } catch (err) {
                console.error('Failed to apply edit:', err);
                window.showErrorMessage('Failed to change file mode');
            }

        } catch (err) {
            console.error('Error in toggleReadonly:', err);
            window.showErrorMessage('Failed to toggle readonly mode');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    if (autoLockTimeout) {
        clearTimeout(autoLockTimeout);
    }
    if (disposable) {
        disposable.dispose();
    }
}
