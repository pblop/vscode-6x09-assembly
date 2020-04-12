export interface Range {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  character: number;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace CompletionItemKind {
  const Text: 1;
  const Method: 2;
  const Function: 3;
  const Constructor: 4;
  const Field: 5;
  const Variable: 6;
  const Class: 7;
  const Interface: 8;
  const Module: 9;
  const Property: 10;
  const Unit: 11;
  const Value: 12;
  const Enum: 13;
  const Keyword: 14;
  const Snippet: 15;
  const Color: 16;
  const File: 17;
  const Reference: 18;
  const Folder: 19;
  const EnumMember: 20;
  const Constant: 21;
  const Struct: 22;
  const Event: 23;
  const Operator: 24;
  const TypeParameter: 25;
}

export declare type CompletionItemKind = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25;


export class AssemblySymbol {
    constructor(
      public name: string,
      public range: Range,
      public documentation: string,
      public kind: CompletionItemKind,
      public lineRange: Range,
      public filePath: string
    ) { }
  }