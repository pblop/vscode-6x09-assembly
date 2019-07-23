import { TextEditor, TextEditorEdit } from 'vscode';
import { ConfigurationManager, OpcodeCase } from './managers/configuration';
import { WorkspaceManager } from './managers/workspace';
import { AssemblyLine } from './parsers/assembly-line';
import { convertToCase, execCmd } from './utilities';

export interface ITextEditorCommand {
  handler(textEditor: TextEditor, edit: TextEditorEdit, ...args: any[]): void;
}

export interface ICommand {
  handler(...args: any[]): any;
}

export class ChangeCaseOpcodeCommand implements ITextEditorCommand {

  constructor(private workspaceManager: WorkspaceManager, private casing: OpcodeCase) {
  }
  public handler(textEditor: TextEditor, edit: TextEditorEdit) {
    const assemblyDocument = this.workspaceManager.getAssemblyDocument(textEditor.document);

    assemblyDocument.lines.forEach((line: AssemblyLine) => {
      if (line.opcode && !assemblyDocument.findMacro(line.opcode).length) {
        edit.replace(line.opcodeRange, convertToCase(line.opcode, this.casing));
      }
    });
  }
}

export class StartEmulatorCommand implements ICommand {

  constructor(private configurationManager: ConfigurationManager) {
  }
  public handler(): any {
    return execCmd(
      '/Applications/XRoar.app/Contents/MacOS/xroar',
      [
        // '-becker',
        '-machine-desc',
        'cocous',
        '-vdg-type',
        '6847t1',
      ],
      '.'
    );
  }
}
