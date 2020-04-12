import * as cp from 'child_process';
import * as vscode from 'vscode';
import { Range, Position, AssemblySymbol } from './common';
import { ExtensionState } from './extension';
import { OpcodeCase } from './managers/configuration';
import * as fileUrl from 'file-url';


export function filePathToUri(filePath: string): vscode.Uri {
  return  vscode.Uri.parse(fileUrl(filePath, {resolve: false}), true);
}

export function uriToFilePath(uri: vscode.Uri): string {
  return uri.fsPath;
}

export function convertPosition(position: Position): vscode.Position {
  return new vscode.Position(position.line, position.character);
}

export function convertRange(range: Range): vscode.Range {
  return new vscode.Range(convertPosition(range.start), convertPosition(range.end));
}

export function symbolToLocation(s: AssemblySymbol): vscode.Location {
  return new vscode.Location(filePathToUri(s.filePath), convertRange(s.range));
}

export function convertToCase(name: string, casing: OpcodeCase): string {
  if (casing === OpcodeCase.lowercase) {
    return name.toLowerCase();
  }
  if (casing === OpcodeCase.capitalised) {
    return name[0].toUpperCase() + name.substr(1).toLowerCase();
  }
  return name.toUpperCase();
}

export function convertToSymbolKind(kind: string): vscode.SymbolKind {
  return vscode.SymbolKind[kind];
}

export function symbolToDocumentSymbol(s: AssemblySymbol): vscode.DocumentSymbol {
  return new vscode.DocumentSymbol(s.name, s.documentation, convertToSymbolKind(s.kind.toString()), convertRange(s.lineRange), convertRange(s.range));
}

export function killProcess(process: cp.ChildProcess, details = ''): void {
  const outputChannel = ExtensionState.windowManager.outputChannel;

  if (process) {
    try {
      process.kill();
    } catch (e) {
      outputChannel.appendLine(`${process.pid}:M: Error killing process (${details}): ${e}`);
    }
    outputChannel.appendLine(`${process.pid}:M: Killed proccess (${details})`);
  }
}

export function execCmd(cmd: string, args: string[], cwd: string, token?: vscode.CancellationToken): Promise<cp.ChildProcess> {
  return new Promise((resolve, reject) => {
    const outputChannel = ExtensionState.windowManager.outputChannel;

    const details = [cmd, ...args].join(' ');

    const process = cp.execFile(cmd, args, { cwd });

    if (process.pid) {

      process.stdout.on('data', (data: string) => {
        data.split(/\r?\n/).forEach(line => {
          outputChannel.appendLine(`${process.pid}:O: ${line}`);
        });
      });

      process.stderr.on('data', (data: string) => {
        data.split(/\r?\n/).forEach(line => {
          outputChannel.appendLine(`${process.pid}:E: ${line}`);
        });
      });

      process.on('error', err => {
        outputChannel.appendLine(`${process.pid}:M: Error executing procces ${process.pid} (${details}): ${err.message}`);
        ExtensionState.windowManager.showErrorMessage(err.message);
      });

      process.on('exit', (code, signal) => {
        if (code) {
          outputChannel.appendLine(`${process.pid}:M: Exited (${[cmd, ...args].join(' ')}) with code: ${code}`);
        } else if (signal) {
          outputChannel.appendLine(`${process.pid}:M: Exited (${[cmd, ...args].join(' ')}) from signal: ${signal}`);
        } else {
          outputChannel.appendLine(`${process.pid}:M: Exited (${[cmd, ...args].join(' ')}) normally.`);
        }
      });

      if (token) {
        token.onCancellationRequested(() => {
          if (process) {
            killProcess(process);
          }
        });
      }

      outputChannel.appendLine(`${process.pid}:M: Started (${[cmd, ...args].join(' ')}) in "${cwd}"`);
      resolve(process);
    } else {
      reject(new Error(`Unable to start process (${details}) in "${cwd}"`));
    }
  });
}
