import { EventEmitter } from 'events';
import { readFileSync } from 'fs';
import { ILaunchRequestArguments } from './debug-session';

export interface IBreakpoint {
  id: number;
  line: number;
  verified: boolean;
}

export class Debugger extends EventEmitter {

  // the initial (and one and only) file we are 'debugging'
  private assemblyFile: string;
  public get sourceFile() {
    return this.assemblyFile;
  }

  // Run control
  public start(program: string, stopOnEntry: boolean) {
    throw new Error('Method not implemented.');
  }

  public continue(reverse = false) {
    throw new Error('Method not implemented.');
  }

  public step(reverse = false, event = 'stopOnStep') {
    throw new Error('Method not implemented.');
  }

  // Breakpoints
  public clearBreakPoint(path: string, line: number): IBreakpoint | undefined {
    throw new Error('Method not implemented.');
  }

  public clearBreakpoints(path: string) {
    throw new Error('Method not implemented.');
  }

  public setBreakPoint(path: string, line: number): IBreakpoint {
    throw new Error('Method not implemented.');
  }

  // Stacks
  public stack(startFrame: number, endFrame: number): any {
    throw new Error('Method not implemented.');
  }

  // Helpers

}
