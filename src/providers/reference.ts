import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';
import { SymbolManager } from '../managers/symbol';
import { symbolToLocation, convertRange } from '../utilities';

export class ReferenceProvider implements vscode.ReferenceProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

        if (!token.isCancellationRequested) {
          const word = document.getText(range);
          const assemblyLine = assemblyDocument.lines[position.line];
          const symbolManager = this.workspaceManager.getSymbolManager(document);

          if (assemblyLine.label && range.intersection(convertRange(assemblyLine.labelRange))) {
            resolve(this.findReferences(symbolManager, word, context.includeDeclaration, document.uri));
            return;
          }

          if (assemblyLine.opcode && range.intersection(convertRange(assemblyLine.opcodeRange))) {
            resolve(this.findReferences(symbolManager, word, context.includeDeclaration, document.uri));
            return;
          }

          if (assemblyLine.operand && range.intersection(convertRange(assemblyLine.operandRange))) {
            resolve(this.findReferences(symbolManager, word, context.includeDeclaration, document.uri));
            return;
          }
        }

        reject();
      }
    });
  }

  private findReferences(symbolsManager: SymbolManager, word: string, includeDeclaration: boolean, uri: vscode.Uri): vscode.Location[] {
    return symbolsManager.findReferencesByName(word, includeDeclaration).map(s => symbolToLocation(s));
  }

}
