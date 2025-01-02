import * as vscode from "vscode";

let autoLockTimeout: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("era.toggleReadonly", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    const uri = document.uri;

    // Используем WorkspaceEdit для управления readonly
    const edit = new vscode.WorkspaceEdit();
    const currentReadonly = vscode.workspace.fs.isWritableFileSystem(
      uri.scheme,
    );

    if (currentReadonly) {
      edit.createFile(uri, { overwrite: true, ignoreIfExists: true });
    }

    vscode.workspace.applyEdit(edit).then(() => {
      vscode.window.showInformationMessage(
        `Readonly mode ${currentReadonly ? "enabled" : "disabled"}`,
      );
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  if (autoLockTimeout) {
    clearTimeout(autoLockTimeout);
  }
}
