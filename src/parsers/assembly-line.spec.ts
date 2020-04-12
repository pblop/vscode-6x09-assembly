// import * as path from 'path';
import { Range, CompletionItemKind } from 'vscode-languageserver-protocol';

// Classes under test
// import * as parser from './assembly-document';
import { AssemblyLine } from './assembly-line';
// import { AssemblySymbol } from '../common';
// import { SymbolManager } from '../managers/symbol';

interface SymbolOrReferenceDefinition {
  range: Range;
  name: string;
  documentation: string;
  kind: CompletionItemKind;
  lineRange: Range;
}

// function createRange(line: number, from: number, to: number): Range {
//   return { start: { line: line, character: from} as Position, end: { line: line, character: to} as Position} as Range;
// }

// function compareSymbolsOrReferences(actual: AssemblySymbol[], expected: SymbolOrReferenceDefinition[]): boolean {
//   if (actual.length !== expected.length) {
//     return false;
//   }

//   let count = actual.length;
//   while (count--) {
//     if (actual[count].documentation !== expected[count].documentation
//       || actual[count].kind !== expected[count].kind
//       || actual[count].name !== expected[count].name
//       || actual[count].range.start.line !== expected[count].range.start.line
//       || actual[count].range.start.character !== expected[count].range.start.character
//       || actual[count].range.end.line !== expected[count].range.end.line
//       || actual[count].range.end.character !== expected[count].range.end.character
//       || actual[count].lineRange.start.line !== expected[count].lineRange.start.line
//       || actual[count].lineRange.start.character !== expected[count].lineRange.start.character
//       || actual[count].lineRange.end.line !== expected[count].lineRange.end.line
//       || actual[count].lineRange.end.character !== expected[count].lineRange.end.character) {
//         return false;
//       }
//   }
//   return true;
// }

// const testFolderLocation = '../../test/data';

test('See comment line from start (asterisk)', () => {
  const text = '* This is a comment';
  const expected = 'This is a comment';
  const expectedStart = 2;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.comment).toBe(expected);
  expect(line.commentRange.start.character).toBe(expectedStart);
  expect(line.commentRange.end.character).toBe(expectedEnd);
});

test('See comment line from start (semicolon)', () => {
  const text = '; This is a comment';
  const expected = 'This is a comment';
  const expectedStart = 2;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.comment).toBe(expected);
  expect(line.commentRange.start.character).toBe(expectedStart);
  expect(line.commentRange.end.character).toBe(expectedEnd);
});

test('See comment line from anywhere (asterisk)', () => {
  const text = '\t\t* This is a comment';
  const expected = 'This is a comment';
  const expectedStart = 4;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.comment).toBe(expected);
  expect(line.commentRange.start.character).toBe(expectedStart);
  expect(line.commentRange.end.character).toBe(expectedEnd);
});

test('See comment line from anywhere (semicolon)', () => {
  const text = '        ; This is a comment';
  const expected = 'This is a comment';
  const expectedStart = 10;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.comment).toBe(expected);
  expect(line.commentRange.start.character).toBe(expectedStart);
  expect(line.commentRange.end.character).toBe(expectedEnd);
});

test('Find label with no label on line', () => {
  const text = ' clra';
  const expected = '';
  const expectedStart = 0;
  const expectedEnd = 0;

  const line = new AssemblyLine(text);

  expect(line.label).toBe(expected);
  expect(line.labelRange.start.character).toBe(expectedStart);
  expect(line.labelRange.end.character).toBe(expectedEnd);
});

test('Find label alone on line', () => {
  const text = 'Start';
  const expected = 'Start';
  const expectedStart = 0;
  const expectedEnd = expected.length;

  const line = new AssemblyLine(text);

  expect(line.label).toBe(expected);
  expect(line.labelRange.start.character).toBe(expectedStart);
  expect(line.labelRange.end.character).toBe(expectedEnd);
});

test('Find label on line with opcode', () => {
  const text = 'Start   clra';
  const expected = 'Start';
  const expectedStart = 0;
  const expectedEnd = expected.length;

  const line = new AssemblyLine(text);

  expect(line.label).toBe(expected);
  expect(line.labelRange.start.character).toBe(expectedStart);
  expect(line.labelRange.end.character).toBe(expectedEnd);
});

test('Find label on line with opcode and operand', () => {
  const text = 'Sta_rt   lda     #$40';
  const expected = 'Sta_rt';
  const expectedStart = 0;
  const expectedEnd = expected.length;

  const line = new AssemblyLine(text);

  expect(line.label).toBe(expected);
  expect(line.labelRange.start.character).toBe(expectedStart);
  expect(line.labelRange.end.character).toBe(expectedEnd);
});

test('Find label on line with opcode and operand and comment', () => {
  const text = 'Sta.rt   lda     #$40    load *';
  const expected = 'Sta.rt';
  const expectedStart = 0;
  const expectedEnd = expected.length;

  const line = new AssemblyLine(text);

  expect(line.label).toBe(expected);
  expect(line.labelRange.start.character).toBe(expectedStart);
  expect(line.labelRange.end.character).toBe(expectedEnd);
});

test('Find label on line with label and comment (asterisk)', () => {
  const text = 'S$tart            * a comment';
  const expected = 'S$tart';
  const expectedStart = 0;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.label).toBe(expected);
  expect(line.labelRange.start.character).toBe(expectedStart);
  expect(line.labelRange.end.character).toBe(expectedEnd);
});

test('Find label on line with label and comment (semicolon)', () => {
  const text = 'Start@            ; a comment';
  const expected = 'Start@';
  const expectedStart = 0;
  const expectedEnd = expected.length;

  const line = new AssemblyLine(text);

  expect(line.label).toBe(expected);
  expect(line.labelRange.start.character).toBe(expectedStart);
  expect(line.labelRange.end.character).toBe(expectedEnd);
});

test('Find opcode on line with opcode', () => {
  const text = '   clra';
  const expected = 'clra';
  const expectedStart = 3;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.opcode).toBe(expected);
  expect(line.opcodeRange.start.character).toBe(expectedStart);
  expect(line.opcodeRange.end.character).toBe(expectedEnd);
});

test('Find opcode on line with opcode and label', () => {
  const text = 'Start   clra';
  const expected = 'clra';
  const expectedStart = 8;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.opcode).toBe(expected);
  expect(line.opcodeRange.start.character).toBe(expectedStart);
  expect(line.opcodeRange.end.character).toBe(expectedEnd);
});

test('Find opcode on line with label and operand', () => {
  const text = 'Sta_rt   lda     #$40';
  const expected = 'lda';
  const expectedStart = 9;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.opcode).toBe(expected);
  expect(line.opcodeRange.start.character).toBe(expectedStart);
  expect(line.opcodeRange.end.character).toBe(expectedEnd);
});

test('Find opcode on line with label and operand and comment', () => {
  const text = 'Sta.rt   lda     #$40    load *';
  const expected = 'lda';
  const expectedStart = 9;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.opcode).toBe(expected);
  expect(line.opcodeRange.start.character).toBe(expectedStart);
  expect(line.opcodeRange.end.character).toBe(expectedEnd);
});

test('Find operand on line with opcode', () => {
  const text = '   ldb #$40';
  const expected = '#$40';
  const expectedStart = 7;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.operand).toBe(expected);
  expect(line.operandRange.start.character).toBe(expectedStart);
  expect(line.operandRange.end.character).toBe(expectedEnd);
});

test('Find operand on line with opcode', () => {
  const text = 'hello   ldb #$40';
  const expected = '#$40';
  const expectedStart = 12;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.operand).toBe(expected);
  expect(line.operandRange.start.character).toBe(expectedStart);
  expect(line.operandRange.end.character).toBe(expectedEnd);
});

test('Find symbol in operand', () => {
  const text = ' ldb #screen';
  const expected = 'screen';
  const expectedStart = 6;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.reference).toBe(expected);
  expect(line.referenceRange.start.character).toBe(expectedStart);
  expect(line.referenceRange.end.character).toBe(expectedEnd);
});

test('Should not find symbol in operand', () => {
  const text = ' org $3f00';
  const expected = '';

  const line = new AssemblyLine(text);

  expect(line.reference).toBe(expected);
});

test('Find all columns on a line', () => {
  const text = 'STA010   lda     ,x+    Test of all';
  const expectedLabel = 'STA010';
  const expectedLabelStart = 0;
  const expectedLabelEnd = expectedLabelStart + expectedLabel.length;
  const expectedOpcode = 'lda';
  const expectedOpcodeStart = 9;
  const expectedOpcodeEnd = expectedOpcodeStart + expectedOpcode.length;
  const expectedOperand = ',x+';
  const expectedOperandStart = 17;
  const expectedOperandEnd = expectedOperandStart + expectedOperand.length;
  const expectedComment = 'Test of all';
  const expectedCommentStart = 24;
  const expectedCommentEnd = expectedCommentStart + expectedComment.length;

  const line = new AssemblyLine(text);

  expect(line.label).toBe(expectedLabel);
  expect(line.labelRange.start.character).toBe(expectedLabelStart);
  expect(line.labelRange.end.character).toBe(expectedLabelEnd);
  expect(line.opcode).toBe(expectedOpcode);
  expect(line.opcodeRange.start.character).toBe(expectedOpcodeStart);
  expect(line.opcodeRange.end.character).toBe(expectedOpcodeEnd);
  expect(line.operand).toBe(expectedOperand);
  expect(line.operandRange.start.character).toBe(expectedOperandStart);
  expect(line.operandRange.end.character).toBe(expectedOperandEnd);
  expect(line.comment).toBe(expectedComment);
  expect(line.commentRange.start.character).toBe(expectedCommentStart);
  expect(line.commentRange.end.character).toBe(expectedCommentEnd);
});

test('Find opcode with label named same', () => {
  const text = 'clra   clra';
  const expected = 'clra';
  const expectedStart = 7;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.opcode).toBe(expected);
  expect(line.opcodeRange.start.character).toBe(expectedStart);
  expect(line.opcodeRange.end.character).toBe(expectedEnd);
});

test('Find reference in operand on line with label and opcode', () => {
  const text = 'hello   ldx   #screen';
  const expected = 'screen';
  const expectedStart = 15;
  const expectedEnd = expectedStart + expected.length;

  const line = new AssemblyLine(text);

  expect(line.reference).toBe(expected);
  expect(line.referenceRange.start.character).toBe(expectedStart);
  expect(line.referenceRange.end.character).toBe(expectedEnd);
});

// test('Load document', async () => {
//   const uri = Uri.file(
//     path.join(__dirname, testFolderLocation, 'hello-clean.asm')
//   );
//   const expectedDefinitions: SymbolOrReferenceDefinition[] = [
//     { range: createRange(2, 0, 6), name: 'screen', documentation: '', kind: CompletionItemKind.Constant, lineRange: createRange(2, 0, 15) },
//     { range: createRange(3, 0, 5), name: 'hello', documentation: '', kind: CompletionItemKind.Method, lineRange: createRange(3, 0, 17) },
//     { range: createRange(5, 0, 6), name: 'hel010', documentation: '', kind: CompletionItemKind.Method, lineRange: createRange(5, 0, 14) },
//     { range: createRange(10, 0, 6), name: 'hel020', documentation: '', kind: CompletionItemKind.Method, lineRange: createRange(10, 0, 14) },
//     { range: createRange(14, 0, 4), name: 'loop', documentation: '', kind: CompletionItemKind.Method, lineRange: createRange(14, 0, 13) },
//     { range: createRange(15, 0, 4), name: 'text', documentation: '', kind: CompletionItemKind.Variable, lineRange: createRange(15, 0, 24) },
//   ];
//   const expectedReferences: SymbolOrReferenceDefinition[] = [
//     { name: 'screen', documentation: '', range: createRange(3, 11, 17), kind: CompletionItemKind.Reference, lineRange: createRange(3, 0, 17) },
//     { name: 'screen', documentation: '', range: createRange(6, 7, 13), kind: CompletionItemKind.Reference, lineRange: createRange(6, 0, 17) },
//     { name: 'hel010', documentation: '', range: createRange(7, 5, 11), kind: CompletionItemKind.Reference, lineRange: createRange(7, 0, 11) },
//     { name: 'text', documentation: '', range: createRange(8, 6, 10), kind: CompletionItemKind.Reference, lineRange: createRange(8, 0, 10) },
//     { name: 'screen', documentation: '', range: createRange(9, 6, 12), kind: CompletionItemKind.Reference, lineRange: createRange(9, 0, 12) },
//     { name: 'loop', documentation: '', range: createRange(11, 5, 9), kind: CompletionItemKind.Reference, lineRange: createRange(11, 0, 9) },
//     { name: 'hel020', documentation: '', range: createRange(13, 5, 11), kind: CompletionItemKind.Reference, lineRange: createRange(13, 0, 11) },
//     { name: 'loop', documentation: '', range: createRange(14, 9, 13), kind: CompletionItemKind.Reference, lineRange: createRange(14, 0, 13) },
//   ];
//   const expectedNumberOfLines = 18;
//   const symbolManager = new SymbolManager();
//   const document = new parser.AssemblyDocument(symbolManager, content);

//   expect(document.lines.length).toBe(expectedNumberOfLines);
//   expect(compareSymbolsOrReferences(symbolManager.definitions, expectedDefinitions)).toBeTruthy();
//   expect(compareSymbolsOrReferences(symbolManager.references, expectedReferences)).toBeTruthy();;
// });
