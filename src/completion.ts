import * as vscode from 'vscode';
import { DocOpcode } from './docs';
import { AssemblySymbol } from './parser';
import { AssemblyWorkspaceManager } from './workspace-manager';

export class CompletionItemProvider implements vscode.CompletionItemProvider {

  constructor(private workspaceManager: AssemblyWorkspaceManager) {
  }

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.CompletionItem[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const word = document.getText(range);

        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);
        const assemblyLine = assemblyDocument.lines[position.line];

        if (assemblyLine.opcode && range.intersection(assemblyLine.opcodeRange)) {
          resolve(this.workspaceManager.opcodeDocs.findOpcode(word.toUpperCase()).map(opcode => this.createOpcodeCompletionItem(opcode)));
        }

        if (assemblyLine.operand && range.intersection(assemblyLine.operandRange)) {
          resolve(assemblyDocument.findLabel(word).map(label => this.createSymbolCompletionItem(label)));
          return;
        }
      }

      reject();
    });
  }

  private createSymbolCompletionItem(symbol: AssemblySymbol): vscode.CompletionItem {
    const item = new vscode.CompletionItem(symbol.name, vscode.CompletionItemKind.Variable);
    if (symbol.documentation) {
      item.detail = symbol.documentation;
    }

    return item;
  }

  private createOpcodeCompletionItem(opcode: DocOpcode): vscode.CompletionItem {
    const item = new vscode.CompletionItem(opcode.name.toLowerCase(), vscode.CompletionItemKind.Keyword);
    if (opcode.documentation) {
      item.detail = opcode.documentation;
    }

    return item;
  }}