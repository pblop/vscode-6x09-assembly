import { TextEditor, TextEditorEdit } from 'vscode';
import { opcodeCase } from './config';
import { AssemblyLine } from './parser';
import { convertToCase } from './utilities';
import { AssemblyWorkspaceManager } from './workspace-manager';

export class ChangeCaseOpcodeCommand {

  constructor(private workspaceManager: AssemblyWorkspaceManager, private casing: opcodeCase) {
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