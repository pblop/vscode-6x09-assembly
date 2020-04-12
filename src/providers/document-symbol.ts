import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';
import { symbolToDocumentSymbol } from '../utilities';

export class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
    return new Promise(resolve => {
      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (!token.isCancellationRequested) {
        resolve(symbolManager.definitions.map(s => symbolToDocumentSymbol(s)));
      }
    });
  }
}
