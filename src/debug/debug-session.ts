// const { Subject } = require('await-notify');
// import { Subject } from 'await-notify';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as da from '../../node_modules/vscode-debugadapter';
import { DebugProtocol } from '../../node_modules/vscode-debugprotocol';
import { execCmd } from '../utilities';
import { DebuggerRuntime, IBreakpoint } from './debug-runtime';

/**
 * This interface describes the 6x09 debug specific launch attributes
 * (which are not part of the Debug Adapter Protocol).
 * The schema for these attributes lives in the package.json of the vscode-6x09-assembly extension.
 * The interface should always match this schema.
 */

export interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
  /** enable logging the Debug Adapter Protocol */
  trace?: boolean;

  /** An relative path (Workspace Folder) to the source file. */
  sourceFile: string;

  /** An absolute path to the source file Map. */
  sourceFileMap: string;

  /** An absolute path to the assembler. */
  assembler: string;

  /** Assembler options */
  assemblerOptions: string[];

  /** Assembler working directory */
  assemblyWorkingDir: string;

  /** emulator program */
  emulator?: string;

  /** Emulator options */
  emulatorOptions: string[];

  /** emulator working directory */
  emulatorWorkingDir?: string;
}

export class DebugSession extends da.LoggingDebugSession {

  // we don't support multiple threads, so we can use a hardcoded ID for the default thread
  private static THREAD_ID = 1;
  /** Token to cancel the emulator */
  private cancellationTokenSource?: vscode.CancellationTokenSource;

  // the 6x09 debugger
  private debugger: DebuggerRuntime;

  private variableHandles = new da.Handles<string>();

  // private configurationDone = new Subject();

  /**
   * Creates a new debug adapter that is used for one debug session.
   * We configure the default implementation of a debug adapter here.
   */
  public constructor() {
    super();

    // this debugger uses one-based lines and columns
    this.setDebuggerLinesStartAt1(true);
    this.setDebuggerColumnsStartAt1(true);

    this.debugger = new DebuggerRuntime();

    // setup event handlers
    this.debugger.on('stopOnStep', () => {
      this.sendEvent(new da.StoppedEvent('step', DebugSession.THREAD_ID));
    });
    this.debugger.on('stopOnBreakpoint', () => {
      this.sendEvent(new da.StoppedEvent('breakpoint', DebugSession.THREAD_ID));
    });
    this.debugger.on('stopOnException', () => {
      this.sendEvent(new da.StoppedEvent('exception', DebugSession.THREAD_ID));
    });
    this.debugger.on('breakpointValidated', (bp: IBreakpoint) => {
      this.sendEvent(new da.BreakpointEvent('changed', { verified: bp.verified, id: bp.id } as DebugProtocol.Breakpoint));
    });
    this.debugger.on('output', (text, filePath, line, column) => {
      const e: DebugProtocol.OutputEvent = new da.OutputEvent(`${text}\n`);
      e.body.source = this.createSource(filePath);
      e.body.line = this.convertDebuggerLineToClient(line);
      e.body.column = this.convertDebuggerColumnToClient(column);
      this.sendEvent(e);
    });
    this.debugger.on('end', () => {
      this.sendEvent(new da.TerminatedEvent());
    });
  }

  /**
   * The 'initialize' request is the first request called by the frontend
   * to interrogate the features the debug adapter provides.
   */
  protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {

    // build and return the capabilities of this debug adapter:
    response.body = response.body || {};

    // the adapter implements the configurationDoneRequest.
    response.body.supportsConfigurationDoneRequest = true;

    // make VS Code to use 'evaluate' when hovering over source
    // response.body.supportsEvaluateForHovers = true;

    // make VS Code to show a 'step back' button
    // response.body.supportsStepBack = true;

    this.sendResponse(response);

    // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
    // we request them early by sending an 'initializeRequest' to the frontend.
    // The frontend will end the configuration sequence by calling 'configurationDone' request.
    this.sendEvent(new da.InitializedEvent());
  }

  /**
   * Called at the end of the configuration sequence.
   * Indicates that all breakpoints etc. have been sent to the DA and that the 'launch' can start.
   */
  protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
    super.configurationDoneRequest(response, args);

    // notify the launchRequest that configuration has finished
    // this.configurationDone.notify();
  }

  protected async launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments) {

    // make sure to 'Stop' the buffered logging if 'trace' is not set
    da.logger.setup(args.trace ? da.Logger.LogLevel.Verbose : da.Logger.LogLevel.Stop, false);

    // wait until configuration has finished (and configurationDoneRequest has been called)
    // await this.configurationDone.wait(1000);

    // start the program in the runtime
    this.debugger.start(args.sourceFile);

    this.sendResponse(response);
  }

  protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): void {

    const assembplyPath = args.source.path;
    const clientLines = args.lines || [];

    // clear all breakpoints for this file
    this.debugger.clearBreakpoints(assembplyPath);

    // set and verify breakpoint locations
    const actualBreakpoints = clientLines.map(l => {
      const { verified, line, id } = this.debugger.setBreakPoint(assembplyPath, this.convertClientLineToDebugger(l));
      const bp = new da.Breakpoint(verified, this.convertDebuggerLineToClient(line)) as DebugProtocol.Breakpoint;
      bp.id = id;
      return bp;
    });

    // send back the actual breakpoint positions
    response.body = {
      breakpoints: actualBreakpoints,
    };
    this.sendResponse(response);
  }

  protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {

    // runtime supports now threads so just return a default thread.
    response.body = {
      threads: [
        new da.Thread(DebugSession.THREAD_ID, 'thread 1'),
      ],
    };
    this.sendResponse(response);
  }

  protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): void {

    const startFrame = typeof args.startFrame === 'number' ? args.startFrame : 0;
    const maxLevels = typeof args.levels === 'number' ? args.levels : 1000;
    const endFrame = startFrame + maxLevels;

    const stk = this.debugger.stack(startFrame, endFrame);

    response.body = {
      stackFrames: stk.frames.map(f => new da.StackFrame(f.index, f.name, this.createSource(f.file), this.convertDebuggerLineToClient(f.line))),
      totalFrames: stk.count,
    };
    this.sendResponse(response);
  }

  protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {

    const frameReference = args.frameId;
    const scopes = new Array<da.Scope>();
    scopes.push(new da.Scope('Local', this.variableHandles.create('local_' + frameReference), false));
    scopes.push(new da.Scope('Global', this.variableHandles.create('global_' + frameReference), true));

    response.body = {
      scopes,
    };
    this.sendResponse(response);
  }

  protected variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments): void {

    const variables = new Array<DebugProtocol.Variable>();
    const id = this.variableHandles.get(args.variablesReference);
    if (id !== null) {
      variables.push({
        name: id + '_i',
        type: 'integer',
        value: '123',
        variablesReference: 0,
      });
      variables.push({
        name: id + '_f',
        type: 'float',
        value: '3.14',
        variablesReference: 0,
      });
      variables.push({
        name: id + '_s',
        type: 'string',
        value: 'hello world',
        variablesReference: 0,
      });
      variables.push({
        name: id + '_o',
        type: 'object',
        value: 'Object',
        variablesReference: this.variableHandles.create('object_'),
      });
    }

    response.body = {
      variables,
    };
    this.sendResponse(response);
  }

  protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): void {
    this.debugger.continue();
    this.sendResponse(response);
  }

  protected reverseContinueRequest(response: DebugProtocol.ReverseContinueResponse, args: DebugProtocol.ReverseContinueArguments): void {
    this.debugger.continue(true);
    this.sendResponse(response);
  }

  protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void {
    this.debugger.step();
    this.sendResponse(response);
  }

  protected stepBackRequest(response: DebugProtocol.StepBackResponse, args: DebugProtocol.StepBackArguments): void {
    this.debugger.step(true);
    this.sendResponse(response);
  }

  protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments): void {

    let reply: string | undefined;

    if (args.context === 'repl') {
      // 'evaluate' supports to create and delete breakpoints from the 'repl':
      let matches = /new +([0-9]+)/.exec(args.expression);
      if (matches && matches.length === 2) {
        const mbp = this.debugger.setBreakPoint(this.debugger.sourceFile, this.convertClientLineToDebugger(parseInt(matches[1], 10)));
        const bp = new da.Breakpoint(mbp.verified, this.convertDebuggerLineToClient(mbp.line), undefined, this.createSource(this.debugger.sourceFile)) as DebugProtocol.Breakpoint;
        bp.id = mbp.id;
        this.sendEvent(new da.BreakpointEvent('new', bp));
        reply = `breakpoint created`;
      } else {
        matches = /del +([0-9]+)/.exec(args.expression);
        if (matches && matches.length === 2) {
          const mbp = this.debugger.clearBreakPoint(this.debugger.sourceFile, this.convertClientLineToDebugger(parseInt(matches[1], 10)));
          if (mbp) {
            const bp = new da.Breakpoint(false) as DebugProtocol.Breakpoint;
            bp.id = mbp.id;
            this.sendEvent(new da.BreakpointEvent('removed', bp));
            reply = 'breakpoint deleted';
          }
        }
      }
    }

    response.body = {
      result: reply ? reply : `evaluate(context: '${args.context}', '${args.expression}')`,
      variablesReference: 0,
    };
    this.sendResponse(response);
  }
  protected checkEmulator(emulatorPath: string): Promise<boolean> {
    return new Promise(resolve => {
      fs.exists(emulatorPath, exists => {
        resolve(exists);
      });
    });
  }

  protected startEmulator(args: ILaunchRequestArguments): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sendEvent(new da.OutputEvent(`Starting emulator: ${args.emulator}`));
      const emulatorExe = args.emulator;
      if (emulatorExe) {
        // Is the emulator exe present in the filesystem?
        this.checkEmulator(emulatorExe).then(exists => {
          if (exists) {
            this.cancellationTokenSource = new vscode.CancellationTokenSource();
            const emulatorWorkingDir = args.emulatorWorkingDir || null;
            execCmd(emulatorExe, args.emulatorOptions, emulatorWorkingDir, this.cancellationTokenSource.token).then(() => {
              this.sendEvent(new da.TerminatedEvent());
              resolve();
            }).catch((err: Error) => {
              reject(new Error(`Error raised by the emulator run: ${err.message}`));
            });
          } else {
            reject(new Error(`The emulator executable '${emulatorExe}' cannot be found`));
          }
        });
      } else {
        reject(new Error('The emulator executable file path must be defined in the launch settings'));
      }

    });
  }

  // ---- helpers

  private createSource(filePath: string): da.Source {
    return new da.Source(path.basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, 'mock-adapter-data');
  }
}
