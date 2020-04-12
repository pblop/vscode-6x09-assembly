import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';
import { convertRange } from '../utilities';

export class RenameProvider implements vscode.RenameProvider {

  constructor(private workspaceManager: WorkspaceManager) { }

  public provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const symbolManager = this.workspaceManager.getSymbolManager(document);

        if (!token.isCancellationRequested) {
          const word = document.getText(range);
          const edit = new vscode.WorkspaceEdit();
          const symbols = symbolManager.findReferencesByName(word, true);
          if (symbols) {
            symbols.forEach(s => edit.replace(document.uri, convertRange(s.range), newName));
          }
          resolve(edit);
        }

        reject();
      }
    });
  }

  public prepareRename?(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string }> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const symbolManager = this.workspaceManager.getSymbolManager(document);

        if (!token.isCancellationRequested) {
          const word = document.getText(range);
          const symbol = symbolManager.findReferencesByName(word, true).find(s => convertRange(s.range).intersection(range));
          if (symbol) {
            resolve({ range: convertRange(symbol.range), placeholder: symbol.name });
          }
        }

        reject();
      }
    });
  }
}
