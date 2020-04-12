import { ListingLine } from './listing-line';

test('Line with only file and line number', () => {
    const text = '                      (      monitor.asm):00001         *****************************************';
    const expectedAddress = -1;
    const expectedFile = 'monitor.asm';
    const expectedLineNumber = 1;
    const expectedValue = '';
    const expectedConinuation = false;

    const line = new ListingLine(text);

    expect(line.address).toBe(expectedAddress);
    expect(line.file).toBe(expectedFile);
    expect(line.lineNumber).toBe(expectedLineNumber);
    expect(line.value).toBe(expectedValue);
    expect(line.continuation).toBe(expectedConinuation);
  });

  test('Line with value, file and line number', () => {
    const text = '     FF41             (      monitor.asm):00009         BeckerStatus    equ     $FF41           Status register for becker port';
    const expectedAddress = -1;
    const expectedFile = 'monitor.asm';
    const expectedLineNumber = 9;
    const expectedValue = 'FF41';
    const expectedConinuation = false;

    const line = new ListingLine(text);

    expect(line.address).toBe(expectedAddress);
    expect(line.file).toBe(expectedFile);
    expect(line.lineNumber).toBe(expectedLineNumber);
    expect(line.value).toBe(expectedValue);
    expect(line.continuation).toBe(expectedConinuation);
  });

  test('Line with address, value, file and line number', () => {
    const text = '7800 8D47             (      monitor.asm):00017         Monitor         bsr     Cls';
    const expectedAddress = 0x7800;
    const expectedFile = 'monitor.asm';
    const expectedLineNumber = 17;
    const expectedValue = '8D47';
    const expectedConinuation = false;

    const line = new ListingLine(text);

    expect(line.address).toBe(expectedAddress);
    expect(line.file).toBe(expectedFile);
    expect(line.lineNumber).toBe(expectedLineNumber);
    expect(line.value).toBe(expectedValue);
    expect(line.continuation).toBe(expectedConinuation);
  });

  test('Line with data continuation', () => {
    const text = '     6F726C642100';
    const expectedAddress = -1;
    const expectedFile = '';
    const expectedLineNumber = -1;
    const expectedValue = '6F726C642100';
    const expectedConinuation = true;

    const line = new ListingLine(text);

    expect(line.address).toBe(expectedAddress);
    expect(line.file).toBe(expectedFile);
    expect(line.lineNumber).toBe(expectedLineNumber);
    expect(line.value).toBe(expectedValue);
    expect(line.continuation).toBe(expectedConinuation);
  });

  test('Line with macro usage', () => {
    const text = '                      (      monitor.asm):00047                         __mon_init';
    const expectedAddress = -1;
    const expectedFile = 'monitor.asm';
    const expectedLineNumber = 47;
    const expectedValue = '';
    const expectedConinuation = false;

    const line = new ListingLine(text);

    expect(line.address).toBe(expectedAddress);
    expect(line.file).toBe(expectedFile);
    expect(line.lineNumber).toBe(expectedLineNumber);
    expect(line.value).toBe(expectedValue);
    expect(line.continuation).toBe(expectedConinuation);
  });

  test('Blank line', () => {
    const text = '                      (      monitor.asm):00044         ';
    const expectedAddress = -1;
    const expectedFile = 'monitor.asm';
    const expectedLineNumber = 44;
    const expectedValue = '';
    const expectedConinuation = false;

    const line = new ListingLine(text);

    expect(line.address).toBe(expectedAddress);
    expect(line.file).toBe(expectedFile);
    expect(line.lineNumber).toBe(expectedLineNumber);
    expect(line.value).toBe(expectedValue);
    expect(line.continuation).toBe(expectedConinuation);
  });