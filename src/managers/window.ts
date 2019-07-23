import * as vscode from 'vscode';

export class WindowManager implements vscode.Disposable {

  private channel = vscode.window.createOutputChannel('6x09 Assembly');

  public get outputChannel() {
    return this.channel;
  }

  public dispose() {
    this.channel.dispose();
  }

  public showErrorMessage(message: string): void {
    vscode.window.showErrorMessage(message);
  }
}
