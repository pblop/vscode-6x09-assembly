import * as Net from 'net';
import * as vscode from 'vscode';
import { DebugSession } from './debug-session';

export class DebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {

  private server?: Net.Server;

  public createDebugAdapterDescriptor(vscSession: vscode.DebugSession, executable: vscode.DebugAdapterExecutable): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {

      if (!this.server) {
        // start listening on a random port
        this.server = Net.createServer(socket => {
          const session = new DebugSession();
          session.setRunAsServer(true);
          session.start(socket as NodeJS.ReadableStream, socket);
        }).listen(0);
      }

      // make VS Code connect to debug server
      return new vscode.DebugAdapterServer((this.server.address() as Net.AddressInfo).port);
  }
}
