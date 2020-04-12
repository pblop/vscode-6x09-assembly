import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';
import { symbolToLocation, convertRange } from '../utilities';

export class DefinitionProvider implements vscode.DefinitionProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);
        const symbolManager = this.workspaceManager.getSymbolManager(document);

        if (!token.isCancellationRequested) {
          const word = document.getText(range);
          const assemblyLine = assemblyDocument.lines[position.line];

          if ((assemblyLine.operand && range.intersection(convertRange(assemblyLine.operandRange)))
            || (assemblyLine.label && range.intersection(convertRange(assemblyLine.labelRange)))) {
            resolve(symbolManager.findDefinitionsByName(word).map(s => symbolToLocation(s)));
            return;
          }

          if (assemblyLine.opcode && range.intersection(convertRange(assemblyLine.opcodeRange))) {
            resolve(symbolManager.findMacro(word).map(s => symbolToLocation(s)));
            return;
          }
        }

        reject();
      }
    });
  }
}
