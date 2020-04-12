import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';
import { symbolToLocation, convertRange } from '../utilities';

export class DocumentHighlightProvider implements vscode.DocumentHighlightProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideDocumentHighlights(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentHighlight[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);
        const symbolManager = this.workspaceManager.getSymbolManager(document);

        if (!token.isCancellationRequested) {
          const word = document.getText(range);
          const assemblyLine = assemblyDocument.lines[position.line];

          if ((assemblyLine.label && range.intersection(convertRange(assemblyLine.labelRange))) || (assemblyLine.operand && range.intersection(convertRange(assemblyLine.operandRange)))) {
            resolve(symbolManager.findReferencesByName(word, true).map(s => symbolToLocation(s)));
            return;
          }
        }

        reject();
      }
    });
  }
}
