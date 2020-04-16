// Derived work originally from https://github.com/ysei/mc6809-2
// Copyright (c) 2014 Patrick Naughton
// MIT Licence (https://raw.githubusercontent.com/ysei/mc6809-2/master/LICENSE)


enum F {
  CARRY = 1,
  OVERFLOW = 2,
  ZERO = 4,
  NEGATIVE = 8,
  IRQMASK = 16,
  HALFCARRY = 32,
  FIRQMASK = 64,
  ENTIRE = 128
}

/* Instruction timing for single-byte opcodes */
const c6809Cycles: number[] = [
  6, 0, 0, 6, 6, 0, 6, 6, 6, 6, 6, 0, 6, 6, 3, 6,          /* 00-0F */
  0, 0, 2, 4, 0, 0, 5, 9, 0, 2, 3, 0, 3, 2, 8, 6,          /* 10-1F */
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,          /* 20-2F */
  4, 4, 4, 4, 5, 5, 5, 5, 0, 5, 3, 6, 9, 11, 0, 19,        /* 30-3F */
  2, 0, 0, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 2, 0, 2,          /* 40-4F */
  2, 0, 0, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 2, 0, 2,          /* 50-5F */
  6, 0, 0, 6, 6, 0, 6, 6, 6, 6, 6, 0, 6, 6, 3, 6,          /* 60-6F */
  7, 0, 0, 7, 7, 0, 7, 7, 7, 7, 7, 0, 7, 7, 4, 7,          /* 70-7F */
  2, 2, 2, 4, 2, 2, 2, 0, 2, 2, 2, 2, 4, 7, 3, 0,          /* 80-8F */
  4, 4, 4, 6, 4, 4, 4, 4, 4, 4, 4, 4, 6, 7, 5, 5,          /* 90-9F */
  4, 4, 4, 6, 4, 4, 4, 4, 4, 4, 4, 4, 6, 7, 5, 5,          /* A0-AF */
  5, 5, 5, 7, 5, 5, 5, 5, 5, 5, 5, 5, 7, 8, 6, 6,          /* B0-BF */
  2, 2, 2, 4, 2, 2, 2, 0, 2, 2, 2, 2, 3, 0, 3, 0,          /* C0-CF */
  4, 4, 4, 6, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5,          /* D0-DF */
  4, 4, 4, 6, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5,          /* E0-EF */
  5, 5, 5, 7, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6           /* F0-FF */
];

/* Instruction timing for the two-byte opcodes */
const c6809Cycles2: number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,          /* 00-0F */
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,          /* 10-1F */
  0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,          /* 20-2F */
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20,         /* 30-3F */
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,          /* 40-4F */
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,          /* 50-5F */
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,          /* 60-6F */
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,          /* 70-7F */
  0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 4, 0,          /* 80-8F */
  0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 6, 6,          /* 90-9F */
  0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 6, 6,          /* A0-AF */
  0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 7, 7,          /* B0-BF */
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0,          /* C0-CF */
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6,          /* D0-DF */
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6,          /* E0-EF */
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7           /* F0-FF */
];

const MEM_ROM = 0x00000; /* Offset to first bank (ROM) */
const MEM_RAM = 0x10000; /* Offset to second bank (RAM) */
const MEM_FLAGS = 0x20000; /* Offset to flags in memory map */
/* Pending interrupt bits */
const INT_NMI = 1;
const INT_FIRQ = 2;
const INT_IRQ = 4;

function makeSignedByte(x: number): number {
  return x << 24 >> 24;
}

function makeSignedWord(x: number): number {
  return x << 16 >> 16;
}

function SET_V8(a: number, b: number, r: number): number {
  // TODO: might need to mask & 0xff each param.
  return (((a ^ b ^ r ^ (r >> 1)) & 0x80) >> 6);
}

function SET_V16(a: number, b: number, r: number): number {
  // TODO: might need to mask & 0xffff each param.
  return (((a ^ b ^ r ^ (r >> 1)) & 0x8000) >> 14);
}

export class MemBlock {
  start: number;
  len: number;
  read: { (addr: number): number };
  write: { (addr: number, val: number): void };
  constructor(start: number,
    len: number,
    read: { (addr: number): number },
    write: { (addr: number, val: number): void }) {
    this.start = start;
    this.len = len;
    this.read = read;
    this.write = write;
  }
}

export class ROM {
  name: string;
  mem: MemBlock;
  constructor(name: string, mem: MemBlock) {
    this.name = name;
    this.mem = mem;
  }
}

export class Emulator {
  private regX: number;
  private regY: number;
  private regU: number;
  public regS: number;
  public regPC: number;
  private regA: number; // byte
  private regB: number; // byte

  private getRegD = (): number => {
    return 0xffff & (this.regA << 8 | this.regB & 0xff);
  }
  private setRegD = (value: number): void => {
    this.regB = value & 0xff;
    this.regA = (value >> 8) & 0xff;
  }
  private regDP: number; // byte
  private regCC: number; // byte

  private stackAddress: number; // address to set regS to on reset.
  private iClocks: number;
  private buffer: ArrayBuffer;
  public mem: Uint8Array;
  private view: DataView;

  public pcCount = 0;

  private memHandler: MemBlock[] = [];
  public counts = {};
  public inorder = [];


  public debug = false;
  public hex = (v: number, width: number): string => {
    let s = v.toString(16);
    if (!width) width = 2;
    while (s.length < width) {
      s = '0' + s;
    }
    return s;
  }

  public dumpmem(addr: number, count: number): void {
    for (let a = addr; a < addr + count; a++) {
      console.log(a.toString(16) + " " + this.hex(this.M6809ReadByte(a), 2));
    }
  }

  public dumpstack(count: number): void {
    let addr = this.regS;
    for (let i = 0; i < count; i++) {
      console.log(this.hex(this.M6809ReadWord(addr), 4));
      addr += 2;
    }
  }

  public stateToString = (): string => {
    return 'pc:' + this.hex(this.regPC, 4) +
      ' s:' + this.hex(this.regS, 4) +
      ' u:' + this.hex(this.regU, 4) +
      ' x:' + this.hex(this.regX, 4) +
      ' y:' + this.hex(this.regY, 4) +
      ' a:' + this.hex(this.regA, 2) +
      ' b:' + this.hex(this.regB, 2) +
      ' d:' + this.hex(this.getRegD(), 4) +
      ' dp:' + this.hex(this.regDP, 2) +
      ' cc:' + this.flagsToString();
  }

  public nextOp = (): string => {
    let pc = this.regPC;

    let nextop = this.M6809ReadByte(pc);
    let mn = this.mnemonics;
    if (nextop == 0x10) {
      mn = this.mnemonics10;
      nextop = this.M6809ReadByte(++pc);
    } else if (nextop == 0x11) {
      mn = this.mnemonics11;
      nextop = this.M6809ReadByte(++pc);
    }
    return mn[nextop];
  }


  public state = (): string => {
    let pc = this.regPC;

    let nextop = this.M6809ReadByte(pc);
    let mn = this.mnemonics;
    if (nextop == 0x10) {
      mn = this.mnemonics10;
      nextop = this.M6809ReadByte(++pc);
    } else if (nextop == 0x11) {
      mn = this.mnemonics11;
      nextop = this.M6809ReadByte(++pc);
    }

    let ret = this.hex(pc, 4) + ' ' +
      mn[nextop] + ' ' +
      this.hex(this.readByteROM(pc + 1), 2) + ' ' +
      this.hex(this.readByteROM(pc + 2), 2) + ' ';

    ret +=
      ' s:' + this.hex(this.regS, 4) +
      ' u:' + this.hex(this.regU, 4) +
      ' x:' + this.hex(this.regX, 4) +
      ' y:' + this.hex(this.regY, 4) +
      ' a:' + this.hex(this.regA, 2) +
      ' b:' + this.hex(this.regB, 2) +
      ' d:' + this.hex(this.getRegD(), 4) +
      ' dp:' + this.hex(this.regDP, 2) +
      ' cc:' + this.flagsToString() +
      '  [' + this.pcCount + ']';

    return ret;
  }

  public flagsToString = (): string => {
    return ((this.regCC & F.NEGATIVE) ? 'N' : '-') +
      ((this.regCC & F.ZERO) ? 'Z' : '-') +
      ((this.regCC & F.CARRY) ? 'C' : '-') +
      ((this.regCC & F.IRQMASK) ? 'I' : '-') +
      ((this.regCC & F.HALFCARRY) ? 'H' : '-') +
      ((this.regCC & F.OVERFLOW) ? 'V' : '-') +
      ((this.regCC & F.FIRQMASK) ? 'C' : '-') +
      ((this.regCC & F.ENTIRE) ? 'E' : '-');
  }

  public execute = (iClocks: number, interruptRequest: number, breakpoint: number): void => {
    this.iClocks = iClocks;
    if (breakpoint) {
      console.log("breakpoint set: " + breakpoint.toString(16));
    }

    while (this.iClocks > 0) /* Execute for the amount of time alloted */ {

      if (breakpoint && this.regPC == breakpoint) {
        console.log('hit breakpoint at ' + breakpoint.toString(16));
        this.halt();
        break;
      }

      interruptRequest = this.handleIRQ(interruptRequest);

      const mn = this.nextOp();
      if (this.counts.hasOwnProperty(mn)) {
        this.counts[mn]++;
      } else {
        this.inorder.push(mn);
        this.counts[mn] = 1;
      }


      const ucOpcode = this.nextPCByte();
      this.iClocks -= c6809Cycles[ucOpcode]; /* Subtract execution time */
      if (this.debug)
        console.log((this.regPC - 1).toString(16) + ': ' + this.mnemonics[ucOpcode]);


      const instruction = this.instructions[ucOpcode];
      if (instruction == null) {
        console.log('*** illegal opcode: ' + ucOpcode.toString(16) + ' at ' + (this.regPC - 1).toString(16));
        this.iClocks = 0;
        this.halt();
      } else {
        instruction();

      }
    }
  }

  constructor() {
    this.buffer = new ArrayBuffer(0x30000);
    this.mem = new Uint8Array(this.buffer);
    this.view = new DataView(this.buffer, 0);
    this.init11();
  }

  public readByteROM = (addr: number): number => {
    const ucByte = this.mem[MEM_ROM + addr];
    // console.log("Read ROM: " + addr.toString(16) + " -> " + ucByte.toString(16));
    return ucByte;
  }

  public reset = (): void => {
    this.regX = 0;
    this.regY = 0;
    this.regU = 0;
    this.regS = this.stackAddress;
    this.regA = 0;
    this.regB = 0;
    this.regDP = 0;
    this.regCC = F.FIRQMASK | F.IRQMASK;
    this.regPC = 0;
    this._goto((this.readByteROM(0xfffe) << 8) | this.readByteROM(0xffff));
  }

  public setStackAddress = (addr: number): void => {
    this.stackAddress = addr;
  }

  public loadMemory = (bytes: Uint8Array, addr: number): void => {
    this.mem.set(bytes, addr);
  }

  public setMemoryMap = (map: MemBlock[]): void => {
    map.forEach((block, index) => {
      for (let i = 0; i < block.len; i++) {
        this.mem[MEM_FLAGS + block.start + i] = index;
      }
      if (index > 1) {
        this.memHandler.push(block);
      }
    });
  }



  public halted = false;
  public halt = (): void => {
    this.halted = true;
    this.iClocks = 0;
    console.log("halted.");
  }

  private nextPCByte = (): number => {
    this.pcCount++;
    return this.M6809ReadByte(this.regPC++);
  }

  private nextPCWord = (): number => {
    const word = this.M6809ReadWord(this.regPC);
    this.regPC += 2;
    this.pcCount += 2;
    return word;
  }


  private M6809ReadByte = (addr: number): number => {
    const c = this.mem[addr + MEM_FLAGS]; /* If special flag (ROM or hardware) */
    switch (c) {
      case 0: /* Normal RAM */
        const ucb = this.mem[addr + MEM_RAM];
        // console.log("Read RAM: " + addr.toString(16) + " -> " + ucByte.toString(16));
        return ucb; /* Just return it */
      case 1: /* Normal ROM */
        const ucByte = this.mem[addr + MEM_ROM];
        //  console.log("Read ROM: " + addr.toString(16) + " -> " + ucByte.toString(16));
        return ucByte; /* Just return it */
      default: /* Call special handler routine for this address */
        const handler = this.memHandler[c - 2];
        if (handler == undefined) {
          console.log('need read handler at ' + (c - 2));
          return 0;
        }
        return handler.read(addr);
    }
  }

  private M6809WriteByte = (addr: number, ucByte: number): void => {
    const c = this.mem[addr + MEM_FLAGS]; /* If special flag (ROM or hardware) */
    switch (c) {
      case 0: /* Normal RAM */
        // console.log("Write RAM: " + addr.toString(16) + " = " + (ucByte & 0xff).toString(16));
        this.mem[addr + MEM_RAM] = ucByte & 0xff;
        break;
      case 1: /* Normal ROM - nothing to do */

        console.log("******** Write ROM: from PC: " + this.regPC.toString(16) + "   " + addr.toString(16) + " = " + (ucByte & 0xff).toString(16));
        this.mem[addr + MEM_ROM] = ucByte & 0xff; // write it to ROM anyway...
        break;
      default: /* Call special handler routine for this address */
        const handler = this.memHandler[c - 2];
        if (handler == undefined) {
          console.log('need write handler at ' + (c - 2));
        } else
          handler.write(addr, ucByte & 0xff);
        break;
    }
  }

  private M6809ReadWord = (addr: number): number => {
    const hi = this.M6809ReadByte(addr);
    const lo = this.M6809ReadByte(addr + 1);
    return hi << 8 | lo;
  }

  private M6809WriteWord = (addr: number, usWord: number): void => {
    this.M6809WriteByte(addr, usWord >> 8);
    this.M6809WriteByte(addr + 1, usWord);
  }

  private pushByte = (ucByte: number, user: boolean): void => {
    const addr = user ? --this.regU : --this.regS;
    this.M6809WriteByte(addr, ucByte);
  }

  private M6809PUSHBU = (ucByte: number): void => {
    this.pushByte(ucByte, true);
  }

  private M6809PUSHB = (ucByte: number): void => {
    this.pushByte(ucByte, false);
  }

  private M6809PUSHW = (usWord: number): void => {
    // push lo byte first.
    this.M6809PUSHB(usWord);
    this.M6809PUSHB(usWord >> 8);
  }

  private M6809PUSHWU = (usWord: number): void => {
    // push lo byte first.
    this.M6809PUSHBU(usWord);
    this.M6809PUSHBU(usWord >> 8);
  }

  private pullByte = (user: boolean): number => {
    const addr = user ? this.regU : this.regS;
    const val = this.M6809ReadByte(addr);
    if (user) ++this.regU;
    else ++this.regS;
    return val;
  }

  private M6809PULLB = (): number => {
    return this.pullByte(false);
  }

  private M6809PULLBU = (): number => {
    return this.pullByte(true);
  }

  private M6809PULLW = (): number => {
    const hi = this.M6809PULLB();
    const lo = this.M6809PULLB();
    return hi << 8 | lo;
  }

  private M6809PULLWU = (): number => {
    const hi = this.M6809PULLBU();
    const lo = this.M6809PULLBU();
    return hi << 8 | lo;
  }

  private M6809PostByte = (): number => {
    let pReg, usAddr, sTemp;
    const ucPostByte = this.nextPCByte();
    switch (ucPostByte & 0x60) {
      case 0:
        pReg = 'X';
        break;
      case 0x20:
        pReg = 'Y';
        break;
      case 0x40:
        pReg = 'U';
        break;
      case 0x60:
        pReg = 'S';
        break;
    }
    pReg = 'reg' + pReg;

    if ((ucPostByte & 0x80) == 0) {
      /* Just a 5 bit signed offset + register */
      let sByte = ucPostByte & 0x1f;
      if (sByte > 15) /* Two's complement 5-bit value */
        sByte -= 32;
      this.iClocks -= 1;
      return this[pReg] + sByte;
    }

    switch (ucPostByte & 0xf) {
      case 0: /* EA = ,reg+ */
        usAddr = this[pReg];
        this[pReg] += 1;
        this.iClocks -= 2;
        break;
      case 1: /* EA = ,reg++ */
        usAddr = this[pReg];
        this[pReg] += 2;
        this.iClocks -= 3;
        break;
      case 2: /* EA = ,-reg */
        this[pReg] -= 1;
        usAddr = this[pReg];
        this.iClocks -= 2;
        break;
      case 3: /* EA = ,--reg */
        this[pReg] -= 2;
        usAddr = this[pReg];
        this.iClocks -= 3;
        break;
      case 4: /* EA = ,reg */
        usAddr = this[pReg];
        break;
      case 5: /* EA = ,reg + B */
        usAddr = this[pReg] + makeSignedByte(this.regB);
        this.iClocks -= 1;
        break;
      case 6: /* EA = ,reg + A */
        usAddr = this[pReg] + makeSignedByte(this.regA);
        this.iClocks -= 1;
        break;
      case 7: /* illegal */
        console.log('illegal postbyte pattern 7 at ' + (this.regPC - 1).toString(16));
        this.halt();
        usAddr = 0;
        break;
      case 8: /* EA = ,reg + 8-bit offset */
        usAddr = this[pReg] + makeSignedByte(this.nextPCByte());
        this.iClocks -= 1;
        break;
      case 9: /* EA = ,reg + 16-bit offset */
        usAddr = this[pReg] + makeSignedWord(this.nextPCWord());
        this.iClocks -= 4;
        break;
      case 0xA: /* illegal */
        console.log('illegal postbyte pattern 0xA' + (this.regPC - 1).toString(16));
        this.halt();
        usAddr = 0;
        break;
      case 0xB: /* EA = ,reg + D */
        this.iClocks -= 4;
        usAddr = this[pReg] + this.getRegD();
        break;
      case 0xC: /* EA = PC + 8-bit offset */
        sTemp = makeSignedByte(this.nextPCByte());
        usAddr = this.regPC + sTemp;
        this.iClocks -= 1;
        break;
      case 0xD: /* EA = PC + 16-bit offset */
        sTemp = makeSignedWord(this.nextPCWord());
        usAddr = this.regPC + sTemp;
        this.iClocks -= 5;
        break;
      case 0xE: /* Illegal */
        console.log('illegal postbyte pattern 0xE' + (this.regPC - 1).toString(16));
        this.halt();
        usAddr = 0;
        break;
      case 0xF: /* EA = [,address] */
        this.iClocks -= 5;
        usAddr = this.nextPCWord();
        break;
    } /* switch */

    if (ucPostByte & 0x10) /* Indirect addressing */ {
      usAddr = this.M6809ReadWord(usAddr & 0xffff);
      this.iClocks -= 3;
    }
    return usAddr & 0xffff; /* Return the effective address */
  }

  private M6809PSHS = (ucTemp: number): void => {
    let i = 0;

    if (ucTemp & 0x80) {
      this.M6809PUSHW(this.regPC);
      i += 2;
    }
    if (ucTemp & 0x40) {
      this.M6809PUSHW(this.regU);
      i += 2;
    }
    if (ucTemp & 0x20) {
      this.M6809PUSHW(this.regY);
      i += 2;
    }
    if (ucTemp & 0x10) {
      this.M6809PUSHW(this.regX);
      i += 2;
    }
    if (ucTemp & 0x8) {
      this.M6809PUSHB(this.regDP);
      i++;
    }
    if (ucTemp & 0x4) {
      this.M6809PUSHB(this.regB);
      i++;
    }
    if (ucTemp & 0x2) {
      this.M6809PUSHB(this.regA);
      i++;
    }
    if (ucTemp & 0x1) {
      this.M6809PUSHB(this.regCC);
      i++;
    }
    this.iClocks -= i; /* Add extra clock cycles (1 per byte) */
  }


  private M6809PSHU = (ucTemp: number): void => {
    let i = 0;

    if (ucTemp & 0x80) {
      this.M6809PUSHWU(this.regPC);
      i += 2;
    }
    if (ucTemp & 0x40) {
      this.M6809PUSHWU(this.regU);
      i += 2;
    }
    if (ucTemp & 0x20) {
      this.M6809PUSHWU(this.regY);
      i += 2;
    }
    if (ucTemp & 0x10) {
      this.M6809PUSHWU(this.regX);
      i += 2;
    }
    if (ucTemp & 0x8) {
      this.M6809PUSHBU(this.regDP);
      i++;
    }
    if (ucTemp & 0x4) {
      this.M6809PUSHBU(this.regB);
      i++;
    }
    if (ucTemp & 0x2) {
      this.M6809PUSHBU(this.regA);
      i++;
    }
    if (ucTemp & 0x1) {
      this.M6809PUSHBU(this.regCC);
      i++;
    }
    this.iClocks -= i; /* Add extra clock cycles (1 per byte) */
  }


  private M6809PULS = (ucTemp: number): void => {
    let i = 0;
    if (ucTemp & 0x1) {
      this.regCC = this.M6809PULLB();
      i++;
    }
    if (ucTemp & 0x2) {
      this.regA = this.M6809PULLB();
      i++;
    }
    if (ucTemp & 0x4) {
      this.regB = this.M6809PULLB();
      i++;
    }
    if (ucTemp & 0x8) {
      this.regDP = this.M6809PULLB();
      i++;
    }
    if (ucTemp & 0x10) {
      this.regX = this.M6809PULLW();
      i += 2;
    }
    if (ucTemp & 0x20) {
      this.regY = this.M6809PULLW();
      i += 2;
    }
    if (ucTemp & 0x40) {
      this.regU = this.M6809PULLW();
      i += 2;
    }
    if (ucTemp & 0x80) {
      this._goto(this.M6809PULLW());
      i += 2;
    }
    this.iClocks -= i; /* Add extra clock cycles (1 per byte) */
  }

  private M6809PULU = (ucTemp: number): void => {
    let i = 0;
    if (ucTemp & 0x1) {
      this.regCC = this.M6809PULLBU();
      i++;
    }
    if (ucTemp & 0x2) {
      this.regA = this.M6809PULLBU();
      i++;
    }
    if (ucTemp & 0x4) {
      this.regB = this.M6809PULLBU();
      i++;
    }
    if (ucTemp & 0x8) {
      this.regDP = this.M6809PULLBU();
      i++;
    }
    if (ucTemp & 0x10) {
      this.regX = this.M6809PULLWU();
      i += 2;
    }
    if (ucTemp & 0x20) {
      this.regY = this.M6809PULLWU();
      i += 2;
    }
    if (ucTemp & 0x40) {
      this.regU = this.M6809PULLWU();
      i += 2;
    }
    if (ucTemp & 0x80) {
      this._goto(this.M6809PULLWU());
      i += 2;
    }
    this.iClocks -= i; /* Add extra clock cycles (1 per byte) */
  }

  public handleIRQ = (interruptRequest: number): number => {
    /* NMI is highest priority */
    if (interruptRequest & INT_NMI) {
      console.log("taking NMI!!!!");
      this.M6809PUSHW(this.regPC);
      this.M6809PUSHW(this.regU);
      this.M6809PUSHW(this.regY);
      this.M6809PUSHW(this.regX);
      this.M6809PUSHB(this.regDP);
      this.M6809PUSHB(this.regB);
      this.M6809PUSHB(this.regA);
      this.regCC |= 0x80; /* Set bit indicating machine state on stack */
      this.M6809PUSHB(this.regCC);
      this.regCC |= F.FIRQMASK | F.IRQMASK; /* Mask interrupts during service routine */
      this.iClocks -= 19;
      this._goto(this.M6809ReadWord(0xfffc));
      interruptRequest &= ~INT_NMI; /* clear this bit */
      console.log(this.state());
      return interruptRequest;
    }
    /* Fast IRQ is next priority */
    if (interruptRequest & INT_FIRQ && (this.regCC & F.FIRQMASK) == 0) {
      console.log("taking FIRQ!!!!");
      this.M6809PUSHW(this.regPC);
      this.regCC &= 0x7f; /* Clear bit indicating machine state on stack */
      this.M6809PUSHB(this.regCC);
      interruptRequest &= ~INT_FIRQ; /* clear this bit */
      this.regCC |= F.FIRQMASK | F.IRQMASK; /* Mask interrupts during service routine */
      this.iClocks -= 10;
      this._goto(this.M6809ReadWord(0xfff6));
      console.log(this.state());
      return interruptRequest;
    }
    /* IRQ is lowest priority */
    if (interruptRequest & INT_IRQ && (this.regCC & F.IRQMASK) == 0) {
      console.log("taking IRQ!!!!");
      this.M6809PUSHW(this.regPC);
      this.M6809PUSHW(this.regU);
      this.M6809PUSHW(this.regY);
      this.M6809PUSHW(this.regX);
      this.M6809PUSHB(this.regDP);
      this.M6809PUSHB(this.regB);
      this.M6809PUSHB(this.regA);
      this.regCC |= 0x80; /* Set bit indicating machine state on stack */
      this.M6809PUSHB(this.regCC);
      this.regCC |= F.IRQMASK; /* Mask interrupts during service routine */
      this._goto(this.M6809ReadWord(0xfff8));
      interruptRequest &= ~INT_IRQ; /* clear this bit */
      this.iClocks -= 19;
      console.log(this.state());
      return interruptRequest;
    }
    return interruptRequest;
  }

  public toggleDebug = (): void => {
    this.debug = !this.debug;
    console.log("debug " + this.debug);
  }

  private _goto = (usAddr: number): void => {
    if (usAddr == 0xFFB3) {
      console.log("PC from " + this.regPC.toString(16) + " -> " + usAddr.toString(16));
      if (this.getRegD() > 0x9800) {
        console.log('off screen??? ' + this.getRegD().toString(16));
      }
    }
    this.regPC = usAddr;
  }

  private _flagnz = (val: number): void => {
    if ((val & 0xff) == 0)
      this.regCC |= F.ZERO;
    else if (val & 0x80)
      this.regCC |= F.NEGATIVE;
  }

  private _flagnz16 = (val: number): void => {
    if ((val & 0xffff) == 0)
      this.regCC |= F.ZERO;
    else if (val & 0x8000)
      this.regCC |= F.NEGATIVE;
  }

  private _neg = (val: number): number => {
    this.regCC &= ~(F.CARRY | F.ZERO | F.OVERFLOW | F.NEGATIVE);
    if (val == 0x80)
      this.regCC |= F.OVERFLOW;
    val = ~val + 1;
    val &= 0xff;
    this._flagnz(val);
    if (this.regCC & F.NEGATIVE)
      this.regCC |= F.CARRY;
    return val;
  }

  private _com = (val: number): number => {
    this.regCC &= ~(F.ZERO | F.OVERFLOW | F.NEGATIVE);
    this.regCC |= F.CARRY;
    val = ~val;
    val &= 0xff;
    this._flagnz(val);
    return val;
  }

  private _lsr = (val: number): number => {
    this.regCC &= ~(F.ZERO | F.CARRY | F.NEGATIVE);
    if (val & 1)
      this.regCC |= F.CARRY;
    val >>= 1;
    val &= 0xff;
    if (val == 0)
      this.regCC |= F.ZERO;
    return val;
  }

  private _ror = (val: number): number => {
    const oldc = this.regCC & F.CARRY;
    this.regCC &= ~(F.ZERO | F.CARRY | F.NEGATIVE);
    if (val & 1)
      this.regCC |= F.CARRY;
    val = val >> 1 | oldc << 7;
    val &= 0xff;
    this._flagnz(val);
    return val;
  }

  private _asr = (val: number): number => {
    this.regCC &= ~(F.ZERO | F.CARRY | F.NEGATIVE);
    if (val & 1)
      this.regCC |= F.CARRY;
    val = val & 0x80 | val >> 1;
    val &= 0xff;
    this._flagnz(val);
    return val;
  }

  private _asl = (val: number): number => {
    const oldval = val;
    this.regCC &= ~(F.ZERO | F.CARRY | F.OVERFLOW | F.NEGATIVE);
    if (val & 0x80)
      this.regCC |= F.CARRY;
    val <<= 1;
    val &= 0xff;
    this._flagnz(val);
    if ((oldval ^ val) & 0x80)
      this.regCC |= F.OVERFLOW;
    return val;
  }

  private _rol = (val: number): number => {
    const oldval = val;
    const oldc = this.regCC & F.CARRY; /* Preserve old carry flag */
    this.regCC &= ~(F.ZERO | F.CARRY | F.OVERFLOW | F.NEGATIVE);
    if (val & 0x80)
      this.regCC |= F.CARRY;
    val = val << 1 | oldc;
    val &= 0xff;
    this._flagnz(val);
    if ((oldval ^ val) & 0x80)
      this.regCC |= F.OVERFLOW;
    return val;
  }

  private _dec = (val: number): number => {
    val--;
    val &= 0xff;
    this.regCC &= ~(F.ZERO | F.OVERFLOW | F.NEGATIVE);
    this._flagnz(val);
    if (val == 0x7f || val == 0xff)
      this.regCC |= F.OVERFLOW;
    return val;
  }

  private _inc = (val: number): number => {
    val++;
    val &= 0xff;
    this.regCC &= ~(F.ZERO | F.OVERFLOW | F.NEGATIVE);
    this._flagnz(val);
    if (val == 0x80 || val == 0)
      this.regCC |= F.OVERFLOW;
    return val;
  }

  private _tst = (val: number): number => {
    this.regCC &= ~(F.ZERO | F.OVERFLOW | F.NEGATIVE);
    this._flagnz(val);
    return val;
  }

  private _clr = (addr: number): void => {
    this.M6809WriteByte(addr, 0);
    /* clear N,V,C, set Z */
    this.regCC &= ~(F.CARRY | F.OVERFLOW | F.NEGATIVE);
    this.regCC |= F.ZERO;
  }

  private _or = (ucByte1: number, ucByte2: number): number => {
    this.regCC &= ~(F.ZERO | F.OVERFLOW | F.NEGATIVE);
    const ucTemp = ucByte1 | ucByte2;
    this._flagnz(ucTemp);
    return ucTemp;
  }

  private _eor = (ucByte1: number, ucByte2: number): number => {
    this.regCC &= ~(F.ZERO | F.OVERFLOW | F.NEGATIVE);
    const ucTemp = ucByte1 ^ ucByte2;
    this._flagnz(ucTemp);
    return ucTemp;
  }

  private _and = (ucByte1: number, ucByte2: number): number => {
    this.regCC &= ~(F.ZERO | F.OVERFLOW | F.NEGATIVE);
    const ucTemp = ucByte1 & ucByte2;
    this._flagnz(ucTemp);
    return ucTemp;
  }

  private _cmp = (ucByte1: number, ucByte2: number): void => {
    const sTemp = (ucByte1 & 0xff) - (ucByte2 & 0xff);
    this.regCC &= ~(F.ZERO | F.CARRY | F.OVERFLOW | F.NEGATIVE);
    this._flagnz(sTemp);
    if (sTemp & 0x100)
      this.regCC |= F.CARRY;
    this.regCC |= SET_V8(ucByte1, ucByte2, sTemp);
  }

  private _setcc16 = (usWord1: number, usWord2: number, lTemp: number): void => {
    this.regCC &= ~(F.ZERO | F.CARRY | F.OVERFLOW | F.NEGATIVE);
    this._flagnz16(lTemp);
    if (lTemp & 0x10000)
      this.regCC |= F.CARRY;
    this.regCC |= SET_V16(usWord1 & 0xffff, usWord2 & 0xffff, lTemp & 0x1ffff);
  }

  private _cmp16 = (usWord1: number, usWord2: number): void => {
    const lTemp = (usWord1 & 0xffff) - (usWord2 & 0xffff);
    this._setcc16(usWord1, usWord2, lTemp);
  }

  private _sub = (ucByte1: number, ucByte2: number): number => {
    const sTemp = (ucByte1 & 0xff) - (ucByte2 & 0xff);
    this.regCC &= ~(F.ZERO | F.CARRY | F.OVERFLOW | F.NEGATIVE);
    this._flagnz(sTemp);
    if (sTemp & 0x100)
      this.regCC |= F.CARRY;
    this.regCC |= SET_V8(ucByte1, ucByte2, sTemp);
    return sTemp & 0xff;
  }

  private _sub16 = (usWord1: number, usWord2: number): number => {
    const lTemp = (usWord1 & 0xffff) - (usWord2 & 0xffff);
    this._setcc16(usWord1, usWord2, lTemp);
    return lTemp & 0xffff;
  }

  private _sbc = (ucByte1: number, ucByte2: number): number => {
    const sTemp = (ucByte1 & 0xff) - (ucByte2 & 0xff) - (this.regCC & 1);
    this.regCC &= ~(F.ZERO | F.CARRY | F.OVERFLOW | F.NEGATIVE);
    this._flagnz(sTemp);
    if (sTemp & 0x100)
      this.regCC |= F.CARRY;
    this.regCC |= SET_V8(ucByte1, ucByte2, sTemp);
    return sTemp & 0xff;
  }

  private _add = (ucByte1: number, ucByte2: number): number => {
    const sTemp = (ucByte1 & 0xff) + (ucByte2 & 0xff);
    this.regCC &= ~(F.HALFCARRY | F.ZERO | F.CARRY | F.OVERFLOW | F.NEGATIVE);
    this._flagnz(sTemp);
    if (sTemp & 0x100)
      this.regCC |= F.CARRY;
    this.regCC |= SET_V8(ucByte1, ucByte2, sTemp);
    if ((sTemp ^ ucByte1 ^ ucByte2) & 0x10)
      this.regCC |= F.HALFCARRY;
    return sTemp & 0xff;
  }

  private _add16 = (usWord1: number, usWord2: number): number => {
    const lTemp = (usWord1 & 0xffff) + (usWord2 & 0xffff);
    this._setcc16(usWord1, usWord2, lTemp);
    return lTemp & 0xffff;
  }

  private _adc = (ucByte1: number, ucByte2: number): number => {
    const sTemp = (ucByte1 & 0xff) + (ucByte2 & 0xff) + (this.regCC & 1);
    this.regCC &= ~(F.HALFCARRY | F.ZERO | F.CARRY | F.OVERFLOW | F.NEGATIVE);
    this._flagnz(sTemp);
    if (sTemp & 0x100)
      this.regCC |= F.CARRY;
    this.regCC |= SET_V8(ucByte1, ucByte2, sTemp);
    if ((sTemp ^ ucByte1 ^ ucByte2) & 0x10)
      this.regCC |= F.HALFCARRY;
    return sTemp & 0xff;
  }
  private dpAddr = (): number => {
    return (this.regDP << 8) + this.nextPCByte();
  }

  private dpOp = (func: (val: number) => number): void => {
    const addr = this.dpAddr();
    const val = this.M6809ReadByte(addr);
    this.M6809WriteByte(addr, func(val));
  }

  /* direct page addressing */
  private neg = (): void => { this.dpOp(this._neg); }
  private com = (): void => { this.dpOp(this._com); }
  private lsr = (): void => { this.dpOp(this._lsr); }
  private ror = (): void => { this.dpOp(this._ror); }
  private asr = (): void => { this.dpOp(this._asr); }
  private asl = (): void => { this.dpOp(this._asl); }
  private rol = (): void => { this.dpOp(this._rol); }
  private dec = (): void => { this.dpOp(this._dec); }
  private inc = (): void => { this.dpOp(this._inc); }
  private tst = (): void => { this.dpOp(this._tst); }
  private jmp = (): void => { this._goto(this.dpAddr()); }
  private clr = (): void => { this._clr(this.dpAddr()); }

  /* P10  extended Op codes */

  private lbrn = (): void => { this.regPC += 2; }
  private lbhi = (): void => {
    const sTemp = makeSignedWord(this.nextPCWord());
    if (!(this.regCC & (F.CARRY | F.ZERO))) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lbls = (): void => { // 0x23: /* LBLS */
    const sTemp = makeSignedWord(this.nextPCWord());
    if (this.regCC & (F.CARRY | F.ZERO)) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lbcc = (): void => { // 0x24: /* LBCC */
    const sTemp = makeSignedWord(this.nextPCWord());
    if (!(this.regCC & F.CARRY)) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lbcs = (): void => { // 0x25: /* LBCS */
    const sTemp = makeSignedWord(this.nextPCWord());
    if (this.regCC & F.CARRY) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lbne = (): void => { // 0x26: /* LBNE */
    const sTemp = makeSignedWord(this.nextPCWord());
    if (!(this.regCC & F.ZERO)) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lbeq = (): void => { // 0x27: /* LBEQ */
    const sTemp = makeSignedWord(this.nextPCWord());
    if (this.regCC & F.ZERO) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lbvc = (): void => { // 0x28: /* LBVC */
    const sTemp = makeSignedWord(this.nextPCWord());
    if (!(this.regCC & F.OVERFLOW)) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lbvs = (): void => { // 0x29: /* LBVS */
    const sTemp = makeSignedWord(this.nextPCWord());
    if (this.regCC & F.OVERFLOW) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lbpl = (): void => { // 0x2A: /* LBPL */
    const sTemp = makeSignedWord(this.nextPCWord());
    if (!(this.regCC & F.NEGATIVE)) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lbmi = (): void => { // 0x2B: /* LBMI */
    const sTemp = makeSignedWord(this.nextPCWord());
    if (this.regCC & F.NEGATIVE) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lbge = (): void => { // 0x2C: /* LBGE */
    const sTemp = makeSignedWord(this.nextPCWord());
    if (!((this.regCC & F.NEGATIVE) ^ (this.regCC & F.OVERFLOW) << 2)) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lblt = (): void => { // 0x2D: /* LBLT */
    const sTemp = makeSignedWord(this.nextPCWord());
    if ((this.regCC & F.NEGATIVE) ^ (this.regCC & F.OVERFLOW) << 2) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lbgt = (): void => { // 0x2E: /* LBGT */
    const sTemp = makeSignedWord(this.nextPCWord());
    if (!((this.regCC & F.NEGATIVE) ^ (this.regCC & F.OVERFLOW) << 2 || this.regCC & F.ZERO)) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private lble = (): void => { // 0x2F: /* LBLE */
    const sTemp = makeSignedWord(this.nextPCWord());
    if ((this.regCC & F.NEGATIVE) ^ (this.regCC & F.OVERFLOW) << 2 || this.regCC & F.ZERO) {
      this.iClocks -= 1; /* Extra clock if branch taken */
      this.regPC += sTemp;
    }
  }

  private swi2 = (): void => { // 0x3F: /* SWI2 */
    this.regCC |= 0x80; /* Entire machine state stacked */
    this.M6809PUSHW(this.regPC);
    this.M6809PUSHW(this.regU);
    this.M6809PUSHW(this.regY);
    this.M6809PUSHW(this.regX);
    this.M6809PUSHB(this.regDP);
    this.M6809PUSHB(this.regA);
    this.M6809PUSHB(this.regB);
    this.M6809PUSHB(this.regCC);
    this._goto(this.M6809ReadWord(0xfff4));
  }

  private cmpd = (): void => { // 0x83: /* CMPD - immediate*/
    const usTemp = this.nextPCWord();
    this._cmp16(this.getRegD(), usTemp);
  }

  private cmpy = (): void => { // 0x8C: /* CMPY - immediate */
    const usTemp = this.nextPCWord();
    this._cmp16(this.regY, usTemp);
  }

  private ldy = (): void => { // 0x8E: /* LDY - immediate */
    this.regY = this.nextPCWord();
    this._flagnz16(this.regY);
    this.regCC &= ~F.OVERFLOW;
  }

  private cmpdd = (): void => { // 0x93: /* CMPD - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.getRegD(), usTemp);
  }

  private cmpyd = (): void => { // 0x9c: /* CMPY - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.regY, usTemp);
  }

  private ldyd = (): void => { // 0x9E: /* LDY - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.regY = this.M6809ReadWord(usAddr);
    this._flagnz16(this.regY);
    this.regCC &= ~F.OVERFLOW;
  }

  private sty = (): void => { // 0x9F: /* STY - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.M6809WriteWord(usAddr, this.regY);
    this._flagnz16(this.regY);
    this.regCC &= ~F.OVERFLOW;
  }

  private cmpdi = (): void => { // 0xA3: /* CMPD - indexed */
    const usAddr = this.M6809PostByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.getRegD(), usTemp);
  }
  private cmpyi = (): void => { // 0xAC: /* CMPY - indexed */
    const usAddr = this.M6809PostByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.regY, usTemp);
  }
  private ldyi = (): void => { // 0xAE: /* LDY - indexed */
    const usAddr = this.M6809PostByte();
    this.regY = this.M6809ReadWord(usAddr);
    this._flagnz16(this.regY);
    this.regCC &= ~F.OVERFLOW;
  }
  private styi = (): void => { // 0xAF: /* STY - indexed */
    const usAddr = this.M6809PostByte();
    this.M6809WriteWord(usAddr, this.regY);
    this._flagnz16(this.regY);
    this.regCC &= ~F.OVERFLOW;
  }
  private cmpde = (): void => { // 0xB3: /* CMPD - extended */
    const usAddr = this.nextPCWord();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.getRegD(), usTemp);
  }
  private cmpye = (): void => { // 0xBC: /* CMPY - extended */
    const usAddr = this.nextPCWord();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.regY, usTemp);
  }
  private ldye = (): void => { // 0xBE: /* LDY - extended */
    const usAddr = this.nextPCWord();
    this.regY = this.M6809ReadWord(usAddr);
    this._flagnz16(this.regY);
    this.regCC &= ~F.OVERFLOW;
  }
  private stye = (): void => { // 0xBF: /* STY - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteWord(usAddr, this.regY);
    this._flagnz16(this.regY);
    this.regCC &= ~F.OVERFLOW;
  }
  private lds = (): void => { // 0xCE: /* LDS - immediate */
    this.regS = this.nextPCWord();
    this._flagnz16(this.regS);
    this.regCC &= ~F.OVERFLOW;
  }
  private ldsd = (): void => { // 0xDE: /* LDS - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.regS = this.M6809ReadWord(usAddr);
    this._flagnz16(this.regS);
    this.regCC &= ~F.OVERFLOW;
  }
  private stsd = (): void => { // 0xDF: /* STS - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.M6809WriteWord(usAddr, this.regS);
    this._flagnz16(this.regS);
    this.regCC &= ~F.OVERFLOW;
  }
  private ldsi = (): void => { // 0xEE: /* LDS - indexed */
    const usAddr = this.M6809PostByte();
    this.regS = this.M6809ReadWord(usAddr);
    this._flagnz16(this.regS);
    this.regCC &= ~F.OVERFLOW;
  }
  private stsi = (): void => { // 0xEF: /* STS - indexed */
    const usAddr = this.M6809PostByte();
    this.M6809WriteWord(usAddr, this.regS);
    this._flagnz16(this.regS);
    this.regCC &= ~F.OVERFLOW;
  }
  private ldse = (): void => { // 0xFE: /* LDS - extended */
    const usAddr = this.nextPCWord();
    this.regS = this.M6809ReadWord(usAddr);
    this._flagnz16(this.regS);
    this.regCC &= ~F.OVERFLOW;
  }
  private stse = (): void => { // 0xFF: /* STS - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteWord(usAddr, this.regS);
    this._flagnz16(this.regS);
    this.regCC &= ~F.OVERFLOW;
  }

  private p10 = (): void => {
    const op = this.nextPCByte(); /* Second half of opcode */
    this.iClocks -= c6809Cycles2[op]; /* Subtract execution time */
    if (this.debug)
      console.log((this.regPC - 1).toString(16) + ': ' + this.mnemonics10[op]);
    const instruction = this.instructions10[op];
    if (instruction == null) {
      console.log('*** illegal p10 opcode: ' + op.toString(16) + ' at ' + (this.regPC - 1).toString(16));
      this.halt();
    } else {
      instruction();
    }
  }

  private instructions10: { (): void }[] = [
    null, null, null, null, null, null, null, null, // 00..07
    null, null, null, null, null, null, null, null, // 08..0f
    null, null, null, null, null, null, null, null, // 10..17
    null, null, null, null, null, null, null, null, // 18..1f
    null, this.lbrn, this.lbhi, this.lbls, this.lbcc, this.lbcs, this.lbne, this.lbeq, // 20..27
    this.lbvc, this.lbvs, this.lbpl, this.lbmi, this.lbge, this.lblt, this.lbgt, this.lble, // 28..2f
    null, null, null, null, null, null, null, null, // 30..37
    null, null, null, null, null, null, null, this.swi2, // 38..3f
    null, null, null, null, null, null, null, null, // 40..47
    null, null, null, null, null, null, null, null, // 48..4f
    null, null, null, null, null, null, null, null, // 50..57
    null, null, null, null, null, null, null, null, // 58..5f
    null, null, null, null, null, null, null, null, // 60..67
    null, null, null, null, null, null, null, null, // 68..6f
    null, null, null, null, null, null, null, null, // 70..77
    null, null, null, null, null, null, null, null, // 78..7f
    null, null, null, this.cmpd, null, null, null, null, // 80..87
    null, null, null, null, this.cmpy, null, this.ldy, null, // 88..8f
    null, null, null, this.cmpdd, null, null, null, null, // 90..97
    null, null, null, null, this.cmpyd, null, this.ldyd, this.sty, // 98..9f
    null, null, null, this.cmpdi, null, null, null, null, // a0..a7
    null, null, null, null, this.cmpyi, null, this.ldyi, this.styi, // a8..af
    null, null, null, this.cmpde, null, null, null, null, // b0..b7
    null, null, null, null, this.cmpye, null, this.ldye, this.stye, // b8..bf
    null, null, null, null, null, null, null, null, // c0..c7
    null, null, null, null, null, null, this.lds, null, // c8..cf
    null, null, null, null, null, null, null, null, // d0..d7
    null, null, null, null, null, null, this.ldsd, this.stsd, // d8..df
    null, null, null, null, null, null, null, null, // e0..e7
    null, null, null, null, null, null, this.ldsi, this.stsi, // e8..ef
    null, null, null, null, null, null, null, null, // f0..f7
    null, null, null, null, null, null, this.ldse, this.stse // f8..ff
  ];

  private mnemonics10: string[] = [
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 00..07
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 08..0f
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 10..17
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 18..1f
    '     ', 'lbrn ', 'lbhi ', 'lbls ', 'lbcc ', 'lbcs ', 'lbne ', 'lbeq ', // 20..27
    'lbvc ', 'lbvs ', 'lbpl ', 'lbmi ', 'lbge ', 'lblt ', 'lbgt ', 'lble ', // 28..2f
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 30..37
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', 'swi2 ', // 38..3f
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 40..47
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 48..4f
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 50..57
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 58..5f
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 60..67
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 68..6f
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 70..77
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // 78..7f
    '     ', '     ', '     ', 'cmpd ', '     ', '     ', '     ', '     ', // 80..87
    '     ', '     ', '     ', '     ', 'cmpy ', '     ', 'ldy  ', '     ', // 88..8f
    '     ', '     ', '     ', 'cmpdd', '     ', '     ', '     ', '     ', // 90..97
    '     ', '     ', '     ', '     ', 'cmpyd', '     ', 'ldyd ', 'sty  ', // 98..9f
    '     ', '     ', '     ', 'cmpdi', '     ', '     ', '     ', '     ', // a0..a7
    '     ', '     ', '     ', '     ', 'cmpyi', '     ', 'ldyi ', 'styi ', // a8..af
    '     ', '     ', '     ', 'cmpde', '     ', '     ', '     ', '     ', // b0..b7
    '     ', '     ', '     ', '     ', 'cmpye', '     ', 'ldye ', 'stye ', // b8..bf
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // c0..c7
    '     ', '     ', '     ', '     ', '     ', '     ', 'lds  ', '     ', // c8..cf
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // d0..d7
    '     ', '     ', '     ', '     ', '     ', '     ', 'ldsd ', 'stsd ', // d8..df
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // e0..e7
    '     ', '     ', '     ', '     ', '     ', '     ', 'ldsi ', 'stsi ', // e8..ef
    '     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ', // f0..f7
    '     ', '     ', '     ', '     ', '     ', '     ', 'ldse ', 'stse ' // f8..ff
  ];

  /* P10 end */


  /* P11 start */

  private swi3 = (): void => { // 0x3F: /* SWI3 */
    this.regCC |= 0x80; /* Set entire flag to indicate whole machine state on stack */
    this.M6809PUSHW(this.regPC);
    this.M6809PUSHW(this.regU);
    this.M6809PUSHW(this.regY);
    this.M6809PUSHW(this.regX);
    this.M6809PUSHB(this.regDP);
    this.M6809PUSHB(this.regA);
    this.M6809PUSHB(this.regB);
    this.M6809PUSHB(this.regCC);
    this._goto(this.M6809ReadWord(0xfff2));
  }

  private cmpu = (): void => { // 0x83: /* CMPU - immediate */
    const usTemp = this.nextPCWord();
    this._cmp16(this.regU, usTemp);
  }

  private cmps = (): void => { // 0x8C: /* CMPS - immediate */
    const usTemp = this.nextPCWord();
    this._cmp16(this.regS, usTemp);
  }

  private cmpud = (): void => { // 0x93: /* CMPU - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.regU, usTemp);
  }

  private cmpsd = (): void => { // 0x9C: /* CMPS - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.regS, usTemp);
  }

  private cmpui = (): void => { // 0xA3: /* CMPU - indexed */
    const usAddr = this.M6809PostByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.regU, usTemp);
  }

  private cmpsi = (): void => { // 0xAC: /* CMPS - indexed */
    const usAddr = this.M6809PostByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.regS, usTemp);
  }

  private cmpue = (): void => { // 0xB3: /* CMPU - extended */
    const usAddr = this.nextPCWord();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.regU, usTemp);
  }

  private cmpse = (): void => { // 0xBC: /* CMPS - extended */
    const usAddr = this.nextPCWord();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.regS, usTemp);
  }

  private instructions11: { (): void }[] = [];
  private mnemonics11: string[] = [];
  private add11 = (op: number, name: string): void => {
    this.instructions11[op] = this[name];
    this.mnemonics11[op] = name;
  }

  private init11 = (): void => {
    for (let i = 0; i < 256; i++) {
      this.instructions11[i] = null;
      this.mnemonics11[i] = '     ';
    }
    const x = [
      { op: 0x3f, name: 'swi3' },
      { op: 0x83, name: 'cmpu' },
      { op: 0x8c, name: 'cmps' },
      { op: 0x93, name: 'cmpud' },
      { op: 0x9c, name: 'cmpsd' },
      { op: 0xa3, name: 'cmpui' },
      { op: 0xac, name: 'cmpsi' },
      { op: 0xb3, name: 'cmpue' },
      { op: 0xbc, name: 'cmpse' },
    ];
    x.forEach((o, i) => {
      this.instructions11[o.op] = this[o.name];
      this.mnemonics11[o.op] = o.name;
    });
  }

  private p11 = (): void => {
    const op = this.nextPCByte(); /* Second half of opcode */
    this.iClocks -= c6809Cycles2[op]; /* Subtract execution time */
    if (this.debug)
      console.log((this.regPC - 1).toString(16) + ': ' + this.mnemonics11[op]);
    const instruction = this.instructions11[op];
    if (instruction == null) {
      console.log('*** illegal p11 opcode: ' + op.toString(16));
      this.halt();
    } else {
      instruction();
    }
  }

  /* p11 end */

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private nop = (): void => { }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private sync = (): void => { }

  private lbra = (): void => {
    /* LBRA - relative jump */
    const sTemp = makeSignedWord(this.nextPCWord());
    this.regPC += sTemp;
  }

  private lbsr = (): void => {
    /* LBSR - relative call */
    const sTemp = makeSignedWord(this.nextPCWord());
    this.M6809PUSHW(this.regPC);
    this.regPC += sTemp;
  }

  private daa = (): void => {
    let cf = 0;
    const msn = this.regA & 0xf0;
    const lsn = this.regA & 0x0f;
    if (lsn > 0x09 || this.regCC & 0x20) cf |= 0x06;
    if (msn > 0x80 && lsn > 0x09) cf |= 0x60;
    if (msn > 0x90 || this.regCC & 0x01) cf |= 0x60;
    const usTemp = cf + this.regA;
    this.regCC &= ~(F.CARRY | F.NEGATIVE | F.ZERO | F.OVERFLOW);
    if (usTemp & 0x100)
      this.regCC |= F.CARRY;
    this.regA = usTemp & 0xff;
    this._flagnz(this.regA);
  }

  private orcc = (): void => {
    this.regCC |= this.nextPCByte();
  }

  private andcc = (): void => {
    this.regCC &= this.nextPCByte();
  }

  private sex = (): void => {
    this.regA = (this.regB & 0x80) ? 0xFF : 0x00;
    this.regCC &= ~(F.ZERO | F.NEGATIVE);
    const d = this.getRegD();
    this._flagnz16(d);
    this.regCC &= ~F.OVERFLOW;
  }

  private _setreg = (name: string, value: number): void => {
    // console.log(name + '=' + value.toString(16));

    if (name == 'D') {
      this.setRegD(value);
    } else {
      this["reg" + name] = value;
    }
  }

  private M6809TFREXG = (ucPostByte: number, bExchange: boolean): void => {
    let ucTemp = ucPostByte & 0x88;
    if (ucTemp == 0x80 || ucTemp == 0x08) {
      console.log("**** M6809TFREXG problem...");
      ucTemp = 0; /* PROBLEM! */
    }
    let srname, srcval;
    switch (ucPostByte & 0xf0) /* Get source register */ {
      case 0x00: /* D */
        srname = 'D';
        srcval = this.getRegD();
        break;
      case 0x10: /* X */
        srname = 'X';
        srcval = this.regX;
        break;
      case 0x20: /* Y */
        srname = 'Y';
        srcval = this.regY;
        break;
      case 0x30: /* U */
        srname = 'U';
        srcval = this.regU;
        break;
      case 0x40: /* S */
        srname = 'S';
        srcval = this.regS;
        break;
      case 0x50: /* PC */
        srname = 'PC';
        srcval = this.regPC;
        break;
      case 0x80: /* A */
        srname = 'A';
        srcval = this.regA;
        break;
      case 0x90: /* B */
        srname = 'B';
        srcval = this.regB;
        break;
      case 0xA0: /* CC */
        srname = 'CC';
        srcval = this.regCC;
        break;
      case 0xB0: /* DP */
        srname = 'DP';
        srcval = this.regDP;
        break;
      default: /* Illegal */
        console.log("illegal src register in M6809TFREXG");
        this.halt();
        break;
    }
    // console.log('EXG src: ' + srname + '=' + srcval.toString(16));
    switch (ucPostByte & 0xf) /* Get destination register */ {
      case 0x00: /* D */
        // console.log('EXG dst: D=' + this.getRegD().toString(16));
        if (bExchange) {
          this._setreg(srname, this.getRegD());
        }
        this.setRegD(srcval);
        break;
      case 0x1: /* X */
        // console.log('EXG dst: X=' + this.regX.toString(16));
        if (bExchange) {
          this._setreg(srname, this.regX);
        }
        this.regX = srcval;
        break;
      case 0x2: /* Y */
        // console.log('EXG dst: Y=' + this.regY.toString(16));
        if (bExchange) {
          this._setreg(srname, this.regY);
        }
        this.regY = srcval;
        break;
      case 0x3: /* U */
        // console.log('EXG dst: U=' + this.regU.toString(16));
        if (bExchange) {
          this._setreg(srname, this.regU);
        }
        this.regU = srcval;
        break;
      case 0x4: /* S */
        // console.log('EXG dst: S=' + this.regS.toString(16));
        if (bExchange) {
          this._setreg(srname, this.regS);
        }
        this.regS = srcval;
        break;
      case 0x5: /* PC */
        // console.log('EXG dst: PC=' + this.regPC.toString(16));
        if (bExchange) {
          this._setreg(srname, this.regPC);
        }
        this._goto(srcval);
        break;
      case 0x8: /* A */
        // console.log('EXG dst: A=' + this.regA.toString(16));
        if (bExchange) {
          this._setreg(srname, this.regA);
        }
        this.regA = 0xff & srcval;
        break;
      case 0x9: /* B */
        // console.log('EXG dst: B=' + this.regB.toString(16));
        if (bExchange) {
          this._setreg(srname, this.regB);
        }
        this.regB = 0xff & srcval;
        break;
      case 0xA: /* CC */
        // console.log('EXG dst: CC=' + this.regCC.toString(16));
        if (bExchange) {
          this._setreg(srname, this.regCC);
        }
        this.regCC = 0xff & srcval;
        break;
      case 0xB: /* DP */
        // console.log('EXG dst: DP=' + this.regDP.toString(16));
        if (bExchange) {
          this._setreg(srname, this.regDP);
        }
        this.regDP = srcval;
        break;
      default: /* Illegal */
        console.log("illegal dst register in M6809TFREXG");
        this.halt();
        break;
    }
  }

  private exg = (): void => {
    const ucTemp = this.nextPCByte(); /* Get postbyte */
    this.M6809TFREXG(ucTemp, true);
  }

  private tfr = (): void => {
    const ucTemp = this.nextPCByte(); /* Get postbyte */
    this.M6809TFREXG(ucTemp, false);
  }

  private bra = (): void => {
    const offset = makeSignedByte(this.nextPCByte());
    this.regPC += offset;
  }
  private brn = (): void => {
    this.regPC++; // never.
  }
  private bhi = (): void => {
    const offset = makeSignedByte(this.nextPCByte());
    if (!(this.regCC & (F.CARRY | F.ZERO)))
      this.regPC += offset;
  }
  private bls = (): void => {
    const offset = makeSignedByte(this.nextPCByte());
    if (this.regCC & (F.CARRY | F.ZERO))
      this.regPC += offset;
  }

  private branchIf = (go: boolean): void => {
    const offset = makeSignedByte(this.nextPCByte());
    if (go)
      this.regPC += offset;
  }

  private branch = (flag: number, ifSet: boolean): void => {
    this.branchIf((this.regCC & flag) == (ifSet ? flag : 0));
  }

  private bcc = (): void => {
    this.branch(F.CARRY, false);
  }

  private bcs = (): void => {
    this.branch(F.CARRY, true);
  }

  private bne = (): void => {
    this.branch(F.ZERO, false);
  }

  private beq = (): void => {
    this.branch(F.ZERO, true);
  }

  private bvc = (): void => {
    this.branch(F.OVERFLOW, false);
  }

  private bvs = (): void => {
    this.branch(F.OVERFLOW, true);
  }

  private bpl = (): void => {
    this.branch(F.NEGATIVE, false);
  }
  private bmi = (): void => {
    this.branch(F.NEGATIVE, true);
  }

  private bge = (): void => {
    const go = !((this.regCC & F.NEGATIVE) ^ (this.regCC & F.OVERFLOW) << 2);
    this.branchIf(go);
  }
  private blt = (): void => {
    const go = (this.regCC & F.NEGATIVE) ^ (this.regCC & F.OVERFLOW) << 2;
    this.branchIf(go != 0);
  }
  private bgt = (): void => {
    const bit = (this.regCC & F.NEGATIVE) ^ (this.regCC & F.OVERFLOW) << 2;
    const go = bit == 0 || (this.regCC & F.ZERO) != 0;
    this.branchIf(go);
  }
  private ble = (): void => {
    const bit = (this.regCC & F.NEGATIVE) ^ (this.regCC & F.OVERFLOW) << 2;
    const go = bit != 0 || (this.regCC & F.ZERO) != 0;
    this.branchIf(go);
  }

  private leax = (): void => {
    this.regX = this.M6809PostByte();
    this.regCC &= ~F.ZERO;
    if (this.regX == 0)
      this.regCC |= F.ZERO;
  }

  private leay = (): void => {
    this.regY = this.M6809PostByte();
    this.regCC &= ~F.ZERO;
    if (this.regY == 0)
      this.regCC |= F.ZERO;
  }

  private leas = (): void => {
    this.regS = this.M6809PostByte();
  }

  private leau = (): void => {
    this.regU = this.M6809PostByte();
  }

  private pshs = (): void => {
    const ucTemp = this.nextPCByte(); /* Get the flags byte */
    this.M6809PSHS(ucTemp);
  }
  private puls = (): void => {
    const ucTemp = this.nextPCByte(); /* Get the flags byte */
    this.M6809PULS(ucTemp);
  }
  private pshu = (): void => {
    const ucTemp = this.nextPCByte(); /* Get the flags byte */
    this.M6809PSHU(ucTemp);
  }
  private pulu = (): void => {
    const ucTemp = this.nextPCByte(); /* Get the flags byte */
    this.M6809PULU(ucTemp);
  }

  private rts = (): void => { this._goto(this.M6809PULLW()); }

  private abx = (): void => { this.regX += this.regB; }

  private rti = (): void => {
    this.regCC = this.M6809PULLB();
    if (this.regCC & 0x80) /* Entire machine state stacked? */ {
      this.iClocks -= 9;
      this.regA = this.M6809PULLB();
      this.regB = this.M6809PULLB();
      this.regDP = this.M6809PULLB();
      this.regX = this.M6809PULLW();
      this.regY = this.M6809PULLW();
      this.regU = this.M6809PULLW();
    }
    this._goto(this.M6809PULLW());
  }

  private cwai = (): void => {
    this.regCC &= this.nextPCByte();
  }

  private mul = (): void => {
    const usTemp = this.regA * this.regB;
    if (usTemp)
      this.regCC &= ~F.ZERO;
    else
      this.regCC |= F.ZERO;
    if (usTemp & 0x80)
      this.regCC |= F.CARRY;
    else
      this.regCC &= ~F.CARRY;
    this.setRegD(usTemp);
  }

  private swi = (): void => {
    this.regCC |= 0x80; /* Indicate whole machine state is stacked */
    this.M6809PUSHW(this.regPC);
    this.M6809PUSHW(this.regU);
    this.M6809PUSHW(this.regY);
    this.M6809PUSHW(this.regX);
    this.M6809PUSHB(this.regDP);
    this.M6809PUSHB(this.regB);
    this.M6809PUSHB(this.regA);
    this.M6809PUSHB(this.regCC);
    this.regCC |= 0x50; /* Disable further interrupts */
    this._goto(this.M6809ReadWord(0xfffa));
  }

  private nega = (): void => {
    this.regA = this._neg(this.regA);
  }
  private coma = (): void => {
    this.regA = this._com(this.regA);
  }
  private lsra = (): void => {
    this.regA = this._lsr(this.regA);
  }
  private rora = (): void => {
    this.regA = this._ror(this.regA);
  }
  private asra = (): void => {
    this.regA = this._asr(this.regA);
  }
  private asla = (): void => {
    this.regA = this._asl(this.regA);
  }
  private rola = (): void => {
    this.regA = this._rol(this.regA);
  }
  private deca = (): void => {
    this.regA = this._dec(this.regA);
  }
  private inca = (): void => {
    this.regA = this._inc(this.regA);
  }
  private tsta = (): void => {
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regA);
  }

  private clra = (): void => {
    this.regA = 0;
    this.regCC &= ~(F.NEGATIVE | F.OVERFLOW | F.CARRY);
    this.regCC |= F.ZERO;
  }

  private negb = (): void => {
    this.regB = this._neg(this.regB);
  }
  private comb = (): void => {
    this.regB = this._com(this.regB);
  }
  private lsrb = (): void => {
    this.regB = this._lsr(this.regB);
  }
  private rorb = (): void => {
    this.regB = this._ror(this.regB);
  }
  private asrb = (): void => {
    this.regB = this._asr(this.regB);
  }
  private aslb = (): void => {
    this.regB = this._asl(this.regB);
  }
  private rolb = (): void => {
    this.regB = this._rol(this.regB);
  }
  private decb = (): void => {
    this.regB = this._dec(this.regB);
  }
  private incb = (): void => {
    this.regB = this._inc(this.regB);
  }
  private tstb = (): void => {
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regB);
  }

  private clrb = (): void => {
    this.regB = 0;
    this.regCC &= ~(F.NEGATIVE | F.OVERFLOW | F.CARRY);
    this.regCC |= F.ZERO;
  }

  private negi = (): void => { //0x60: /* NEG - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.M6809WriteByte(usAddr, this._neg(ucTemp));
  }

  private comi = (): void => { //0x63: /* COM - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.M6809WriteByte(usAddr, this._com(ucTemp));
  }

  private lsri = (): void => { //0x64: /* LSR - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.M6809WriteByte(usAddr, this._lsr(ucTemp));
  }

  private rori = (): void => { //0x66: /* ROR - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.M6809WriteByte(usAddr, this._ror(ucTemp));
  }

  private asri = (): void => { //0x67: /* ASR - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.M6809WriteByte(usAddr, this._asr(ucTemp));
  }

  private asli = (): void => { //0x68: /* ASL - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.M6809WriteByte(usAddr, this._asl(ucTemp));
  }

  private roli = (): void => { //0x69: /* ROL - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.M6809WriteByte(usAddr, this._rol(ucTemp));
  }

  private deci = (): void => { //0x6A: /* DEC - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.M6809WriteByte(usAddr, this._dec(ucTemp));
  }

  private inci = (): void => { //0x6C: /* INC - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.M6809WriteByte(usAddr, this._inc(ucTemp));
  }

  private tsti = (): void => { //0x6D: /* TST - indexed */
    const usAddr = this.M6809PostByte();
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    const val = this.M6809ReadByte(usAddr);
    this._flagnz(val);
  }

  private jmpi = (): void => { //0x6E: /* JMP - indexed */
    this._goto(this.M6809PostByte());
  }

  private clri = (): void => { //0x6F: /* CLR - indexed */
    const usAddr = this.M6809PostByte();
    this.M6809WriteByte(usAddr, 0);
    this.regCC &= ~(F.OVERFLOW | F.CARRY | F.NEGATIVE);
    this.regCC |= F.ZERO;
  }

  private nege = (): void => { //0x70: /* NEG - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteByte(usAddr, this._neg(this.M6809ReadByte(usAddr)));
  }

  private come = (): void => { //0x73: /* COM - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteByte(usAddr, this._com(this.M6809ReadByte(usAddr)));
  }

  private lsre = (): void => { //0x74: /* LSR - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteByte(usAddr, this._lsr(this.M6809ReadByte(usAddr)));
  }

  private rore = (): void => { //0x76: /* ROR - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteByte(usAddr, this._ror(this.M6809ReadByte(usAddr)));
  }

  private asre = (): void => { //0x77: /* ASR - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteByte(usAddr, this._asr(this.M6809ReadByte(usAddr)));
  }

  private asle = (): void => { //0x78: /* ASL - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteByte(usAddr, this._asl(this.M6809ReadByte(usAddr)));
  }

  private role = (): void => { //0x79: /* ROL - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteByte(usAddr, this._rol(this.M6809ReadByte(usAddr)));
  }

  private dece = (): void => { //0x7A: /* DEC - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteByte(usAddr, this._dec(this.M6809ReadByte(usAddr)));
  }

  private ince = (): void => { //0x7C: /* INC - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteByte(usAddr, this._inc(this.M6809ReadByte(usAddr)));
  }

  private tste = (): void => { //0x7D: /* TST - extended */
    const usAddr = this.nextPCWord();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(ucTemp);
  }

  private jmpe = (): void => { //0x7E: /* JMP - extended */
    this._goto(this.M6809ReadWord(this.regPC));
  }

  private clre = (): void => { //0x7F: /* CLR - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteByte(usAddr, 0);
    this.regCC &= ~(F.CARRY | F.OVERFLOW | F.NEGATIVE);
    this.regCC |= F.ZERO;
  }

  private suba = (): void => { //0x80: /* SUBA - immediate */
    this.regA = this._sub(this.regA, this.nextPCByte());
  }

  private cmpa = (): void => { //0x81: /* CMPA - immediate */
    const ucTemp = this.nextPCByte();
    this._cmp(this.regA, ucTemp);
  }

  private sbca = (): void => { //0x82: /* SBCA - immediate */
    const ucTemp = this.nextPCByte();
    this.regA = this._sbc(this.regA, ucTemp);
  }

  private subd = (): void => { //0x83: /* SUBD - immediate */
    const usTemp = this.nextPCWord();
    this.setRegD(this._sub16(this.getRegD(), usTemp));
  }

  private anda = (): void => { //0x84: /* ANDA - immediate */
    const ucTemp = this.nextPCByte();
    this.regA = this._and(this.regA, ucTemp);
  }

  private bita = (): void => { //0x85: /* BITA - immediate */
    const ucTemp = this.nextPCByte();
    this._and(this.regA, ucTemp);
  }

  private lda = (): void => { //0x86: /* LDA - immediate */
    this.regA = this.nextPCByte();
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regA);
  }

  private eora = (): void => { //0x88: /* EORA - immediate */
    const ucTemp = this.nextPCByte();
    this.regA = this._eor(this.regA, ucTemp);
  }

  private adca = (): void => { //0x89: /* ADCA - immediate */
    const ucTemp = this.nextPCByte();
    this.regA = this._adc(this.regA, ucTemp);
  }

  private ora = (): void => { //0x8A: /* ORA - immediate */
    const ucTemp = this.nextPCByte();
    this.regA = this._or(this.regA, ucTemp);
  }

  private adda = (): void => { //0x8B: /* ADDA - immediate */
    const ucTemp = this.nextPCByte();
    this.regA = this._add(this.regA, ucTemp);
  }

  private cmpx = (): void => { //0x8C: /* CMPX - immediate */
    const usTemp = this.nextPCWord();
    this._cmp16(this.regX, usTemp);
  }

  private bsr = (): void => { //0x8D: /* BSR */
    const sTemp = makeSignedByte(this.nextPCByte());
    this.M6809PUSHW(this.regPC);
    this.regPC += sTemp;
  }

  private ldx = (): void => { //0x8E: /* LDX - immediate */
    const usTemp = this.nextPCWord();
    this.regX = usTemp;
    this._flagnz16(usTemp);
    this.regCC &= ~F.OVERFLOW;
  }

  private subad = (): void => { //0x90: /* SUBA - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._sub(this.regA, ucTemp);
  }

  private cmpad = (): void => { //0x91: /* CMPA - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this._cmp(this.regA, ucTemp);
  }

  private sbcad = (): void => { //0x92: /* SBCA - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._sbc(this.regA, ucTemp);
  }

  private subdd = (): void => { //0x93: /* SUBD - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this.setRegD(this._sub16(this.getRegD(), usTemp));
  }

  private andad = (): void => { //0x94: /* ANDA - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._and(this.regA, ucTemp);
  }

  private bitad = (): void => { //0x95: /* BITA - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this._and(this.regA, ucTemp);
  }

  private ldad = (): void => { //0x96: /* LDA - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.regA = this.M6809ReadByte(usAddr);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regA);
  }

  private stad = (): void => { //0x97: /* STA - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.M6809WriteByte(usAddr, this.regA);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regA);
  }

  private eorad = (): void => { //0x98: /* EORA - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._eor(this.regA, ucTemp);
  }

  private adcad = (): void => { //0x99: /* ADCA - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._adc(this.regA, ucTemp);
  }

  private orad = (): void => { //0x9A: /* ORA - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._or(this.regA, ucTemp);
  }

  private addad = (): void => { //0x9B: /* ADDA - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._add(this.regA, ucTemp);
  }

  private cmpxd = (): void => { //0x9C: /* CMPX - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.regX, usTemp);
  }

  private jsrd = (): void => { //0x9D: /* JSR - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.M6809PUSHW(this.regPC);
    this._goto(usAddr);
  }

  private ldxd = (): void => { //0x9E: /* LDX - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.regX = this.M6809ReadWord(usAddr);
    this._flagnz16(this.regX);
    this.regCC &= ~F.OVERFLOW;
  }

  private stxd = (): void => { //0x9F: /* STX - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.M6809WriteWord(usAddr, this.regX);
    this._flagnz16(this.regX);
    this.regCC &= ~F.OVERFLOW;
  }

  private subax = (): void => { //0xA0: /* SUBA - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._sub(this.regA, ucTemp);
  }

  private cmpax = (): void => { //0xA1: /* CMPA - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this._cmp(this.regA, ucTemp);
  }

  private sbcax = (): void => { //0xA2: /* SBCA - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._sbc(this.regA, ucTemp);
  }

  private subdx = (): void => { //0xA3: /* SUBD - indexed */
    const usAddr = this.M6809PostByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this.setRegD(this._sub16(this.getRegD(), usTemp));
  }

  private andax = (): void => { //0xA4: /* ANDA - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._and(this.regA, ucTemp);
  }

  private bitax = (): void => { //0xA5: /* BITA - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this._and(this.regA, ucTemp);
  }

  private ldax = (): void => { //0xA6: /* LDA - indexed */
    const usAddr = this.M6809PostByte();
    this.regA = this.M6809ReadByte(usAddr);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regA);
  }

  private stax = (): void => { //0xA7: /* STA - indexed */
    const usAddr = this.M6809PostByte();
    this.M6809WriteByte(usAddr, this.regA);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regA);
  }

  private eorax = (): void => { //0xA8: /* EORA - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._eor(this.regA, ucTemp);
  }

  private adcax = (): void => { //0xA9: /* ADCA - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._adc(this.regA, ucTemp);
  }

  private orax = (): void => { //0xAA: /* ORA - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._or(this.regA, ucTemp);
  }

  private addax = (): void => { //0xAB: /* ADDA - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regA = this._add(this.regA, ucTemp);
  }

  private cmpxx = (): void => { //0xAC: /* CMPX - indexed */
    const usAddr = this.M6809PostByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this._cmp16(this.regX, usTemp);
  }

  private jsrx = (): void => { //0xAD: /* JSR - indexed */
    const usAddr = this.M6809PostByte();
    this.M6809PUSHW(this.regPC);
    this._goto(usAddr);
  }

  private ldxx = (): void => { //0xAE: /* LDX - indexed */
    const usAddr = this.M6809PostByte();
    this.regX = this.M6809ReadWord(usAddr);
    this._flagnz16(this.regX);
    this.regCC &= ~F.OVERFLOW;
  }

  private stxx = (): void => { //0xAF: /* STX - indexed */
    const usAddr = this.M6809PostByte();
    this.M6809WriteWord(usAddr, this.regX);
    this._flagnz16(this.regX);
    this.regCC &= ~F.OVERFLOW;
  }

  private subae = (): void => { //0xB0: /* SUBA - extended */
    const usAddr = this.nextPCWord();
    this.regA = this._sub(this.regA, this.M6809ReadByte(usAddr));
  }

  private cmpae = (): void => { //0xB1: /* CMPA - extended */
    const usAddr = this.nextPCWord();
    this._cmp(this.regA, this.M6809ReadByte(usAddr));
  }

  private sbcae = (): void => { //0xB2: /* SBCA - extended */
    const usAddr = this.nextPCWord();
    this.regA = this._sbc(this.regA, this.M6809ReadByte(usAddr));
  }

  private subde = (): void => { //0xB3: /* SUBD - extended */
    const usAddr = this.nextPCWord();
    this.setRegD(this._sub16(this.getRegD(), this.M6809ReadWord(usAddr)));
  }

  private andae = (): void => { //0xB4: /* ANDA - extended */
    const usAddr = this.nextPCWord();
    this.regA = this._and(this.regA, this.M6809ReadByte(usAddr));
  }

  private bitae = (): void => { //0xB5: /* BITA - extended */
    const usAddr = this.nextPCWord();
    this._and(this.regA, this.M6809ReadByte(usAddr));
  }

  private ldae = (): void => { //0xB6: /* LDA - extended */
    const usAddr = this.nextPCWord();
    this.regA = this.M6809ReadByte(usAddr);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regA);
  }

  private stae = (): void => { //0xB7: /* STA - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteByte(usAddr, this.regA);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regA);
  }

  private eorae = (): void => { //0xB8: /* EORA - extended */
    const usAddr = this.nextPCWord();
    this.regA = this._eor(this.regA, this.M6809ReadByte(usAddr));
  }

  private adcae = (): void => { //0xB9: /* ADCA - extended */
    const usAddr = this.nextPCWord();
    this.regA = this._adc(this.regA, this.M6809ReadByte(usAddr));
  }

  private orae = (): void => { //0xBA: /* ORA - extended */
    const usAddr = this.nextPCWord();
    this.regA = this._or(this.regA, this.M6809ReadByte(usAddr));
  }

  private addae = (): void => { //0xBB: /* ADDA - extended */
    const usAddr = this.nextPCWord();
    this.regA = this._add(this.regA, this.M6809ReadByte(usAddr));
  }

  private cmpxe = (): void => { //0xBC: /* CMPX - extended */
    const usAddr = this.nextPCWord();
    this._cmp16(this.regX, this.M6809ReadWord(usAddr));
  }

  private jsre = (): void => { //0xBD: /* JSR - extended */
    const usAddr = this.nextPCWord();
    this.M6809PUSHW(this.regPC);
    this._goto(usAddr);
  }

  private ldxe = (): void => { //0xBE: /* LDX - extended */
    const usAddr = this.nextPCWord();
    this.regX = this.M6809ReadWord(usAddr);
    this._flagnz16(this.regX);
    this.regCC &= ~F.OVERFLOW;
  }

  private stxe = (): void => { //0xBF: /* STX - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteWord(usAddr, this.regX);
    this._flagnz16(this.regX);
    this.regCC &= ~F.OVERFLOW;
  }

  private subb = (): void => { //0xC0: /* SUBB - immediate */
    const ucTemp = this.nextPCByte();
    this.regB = this._sub(this.regB, ucTemp);
  }

  private cmpb = (): void => { //0xC1: /* CMPB - immediate */
    const ucTemp = this.nextPCByte();
    this._cmp(this.regB, ucTemp);
  }

  private sbcb = (): void => { //0xC2: /* SBCB - immediate */
    const ucTemp = this.nextPCByte();
    this.regB = this._sbc(this.regB, ucTemp);
  }

  private addd = (): void => { //0xC3: /* ADDD - immediate */
    const usTemp = this.nextPCWord();
    this.setRegD(this._add16(this.getRegD(), usTemp));
  }

  private andb = (): void => { //0xC4: /* ANDB - immediate */
    const ucTemp = this.nextPCByte();
    this.regB = this._and(this.regB, ucTemp);
  }

  private bitb = (): void => { //0xC5: /* BITB - immediate */
    const ucTemp = this.nextPCByte();
    this._and(this.regB, ucTemp);
  }

  private ldb = (): void => { //0xC6: /* LDB - immediate */
    this.regB = this.nextPCByte();
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regB);
  }

  private eorb = (): void => { //0xC8: /* EORB - immediate */
    const ucTemp = this.nextPCByte();
    this.regB = this._eor(this.regB, ucTemp);
  }

  private adcb = (): void => { //0xC9: /* ADCB - immediate */
    const ucTemp = this.nextPCByte();
    this.regB = this._adc(this.regB, ucTemp);
  }

  private orb = (): void => { //0xCA: /* ORB - immediate */
    const ucTemp = this.nextPCByte();
    this.regB = this._or(this.regB, ucTemp);
  }

  private addb = (): void => { //0xCB: /* ADDB - immediate */
    const ucTemp = this.nextPCByte();
    this.regB = this._add(this.regB, ucTemp);
  }

  private ldd = (): void => { //0xCC: /* LDD - immediate */
    const d = this.nextPCWord();
    this.setRegD(d);
    this._flagnz16(d);
    this.regCC &= ~F.OVERFLOW;
  }

  private ldu = (): void => { //0xCE: /* LDU - immediate */
    this.regU = this.nextPCWord();
    this._flagnz16(this.regU);
    this.regCC &= ~F.OVERFLOW;
  }

  private sbbd = (): void => { //0xD0: /* SUBB - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._sub(this.regB, ucTemp);
  }

  private cmpbd = (): void => { //0xD1: /* CMPB - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this._cmp(this.regB, ucTemp);
  }

  private sbcd = (): void => { //0xD2: /* SBCB - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._sbc(this.regB, ucTemp);
  }

  private adddd = (): void => { //0xD3: /* ADDD - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this.setRegD(this._add16(this.getRegD(), usTemp));
  }

  private andbd = (): void => { //0xD4: /* ANDB - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._and(this.regB, ucTemp);
  }

  private bitbd = (): void => { //0xD5: /* BITB - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this._and(this.regB, ucTemp);
  }

  private ldbd = (): void => { //0xD6: /* LDB - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.regB = this.M6809ReadByte(usAddr);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regB);
  }

  private stbd = (): void => { //0xD7: /* STB - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.M6809WriteByte(usAddr, this.regB);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regB);
  }

  private eorbd = (): void => { //0xD8: /* EORB - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._eor(this.regB, ucTemp);
  }

  private adcbd = (): void => { //0xD9: /* ADCB - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._adc(this.regB, ucTemp);
  }

  private orbd = (): void => { //0xDA: /* ORB - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._or(this.regB, ucTemp);
  }

  private addbd = (): void => { //0xDB: /* ADDB - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._add(this.regB, ucTemp);
  }

  private lddd = (): void => { //0xDC: /* LDD - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const d = this.M6809ReadWord(usAddr);
    this.setRegD(d);
    this._flagnz16(d);
    this.regCC &= ~F.OVERFLOW;
  }

  private stdd = (): void => { //0xDD: /* STD - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    const d = this.getRegD();
    this.M6809WriteWord(usAddr, d);
    this._flagnz16(d);
    this.regCC &= ~F.OVERFLOW;
  }

  private ldud = (): void => { //0xDE: /* LDU - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.regU = this.M6809ReadWord(usAddr);
    this._flagnz16(this.regU);
    this.regCC &= ~F.OVERFLOW;
  }

  private stud = (): void => { //0xDF: /* STU - direct */
    const usAddr = this.regDP * 256 + this.nextPCByte();
    this.M6809WriteWord(usAddr, this.regU);
    this._flagnz16(this.regU);
    this.regCC &= ~F.OVERFLOW;
  }

  private subbx = (): void => { //0xE0: /* SUBB - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._sub(this.regB, ucTemp);
  }

  private cmpbx = (): void => { //0xE1: /* CMPB - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this._cmp(this.regB, ucTemp);
  }

  private sbcbx = (): void => { //0xE2: /* SBCB - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._sbc(this.regB, ucTemp);
  }

  private adddx = (): void => { //0xE3: /* ADDD - indexed */
    const usAddr = this.M6809PostByte();
    const usTemp = this.M6809ReadWord(usAddr);
    this.setRegD(this._add16(this.getRegD(), usTemp));
  }

  private andbx = (): void => { //0xE4: /* ANDB - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._and(this.regB, ucTemp);
  }

  private bitbx = (): void => { //0xE5: /* BITB - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this._and(this.regB, ucTemp);
  }

  private ldbx = (): void => { //0xE6: /* LDB - indexed */
    const usAddr = this.M6809PostByte();
    this.regB = this.M6809ReadByte(usAddr);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regB);
  }

  private stbx = (): void => { //0xE7: /* STB - indexed */
    const usAddr = this.M6809PostByte();
    this.M6809WriteByte(usAddr, this.regB);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regB);
  }

  private eorbx = (): void => { //0xE8: /* EORB - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._eor(this.regB, ucTemp);
  }

  private adcbx = (): void => { //0xE9: /* ADCB - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._adc(this.regB, ucTemp);
  }

  private orbx = (): void => { //0xEA: /* ORB - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._or(this.regB, ucTemp);
  }

  private addbx = (): void => { //0xEB: /* ADDB - indexed */
    const usAddr = this.M6809PostByte();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._add(this.regB, ucTemp);
  }

  private lddx = (): void => { //0xEC: /* LDD - indexed */
    const usAddr = this.M6809PostByte();
    const d = this.M6809ReadWord(usAddr);
    this.setRegD(d);
    this._flagnz16(d);
    this.regCC &= ~F.OVERFLOW;
  }

  private stdx = (): void => { //0xED: /* STD - indexed */
    const usAddr = this.M6809PostByte();
    const d = this.getRegD();
    this.M6809WriteWord(usAddr, d);
    this._flagnz16(d);
    this.regCC &= ~F.OVERFLOW;
  }

  private ldux = (): void => { //0xEE: /* LDU - indexed */
    const usAddr = this.M6809PostByte();
    this.regU = this.M6809ReadWord(usAddr);
    this._flagnz16(this.regU);
    this.regCC &= ~F.OVERFLOW;
  }

  private stux = (): void => { //0xEF: /* STU - indexed */
    const usAddr = this.M6809PostByte();
    this.M6809WriteWord(usAddr, this.regU);
    this._flagnz16(this.regU);
    this.regCC &= ~F.OVERFLOW;
  }

  private subbe = (): void => { //0xF0: /* SUBB - extended */
    const usAddr = this.nextPCWord();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._sub(this.regB, ucTemp);
  }

  private cmpbe = (): void => { //0xF1: /* CMPB - extended */
    const usAddr = this.nextPCWord();
    const ucTemp = this.M6809ReadByte(usAddr);
    this._cmp(this.regB, ucTemp);
  }

  private sbcbe = (): void => { //0xF2: /* SBCB - extended */
    const usAddr = this.nextPCWord();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._sbc(this.regB, ucTemp);
  }

  private addde = (): void => { //0xF3: /* ADDD - extended */
    const usAddr = this.nextPCWord();
    const usTemp = this.M6809ReadWord(usAddr);
    this.setRegD(this._add16(this.getRegD(), usTemp));
  }

  private andbe = (): void => { //0xF4: /* ANDB - extended */
    const usAddr = this.nextPCWord();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._and(this.regB, ucTemp);
  }

  private bitbe = (): void => { //0xF5: /* BITB - extended */
    const usAddr = this.nextPCWord();
    const ucTemp = this.M6809ReadByte(usAddr);
    this._and(this.regB, ucTemp);
  }

  private ldbe = (): void => { //0xF6: /* LDB - extended */
    const usAddr = this.nextPCWord();
    this.regB = this.M6809ReadByte(usAddr);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regB);
  }

  private stbe = (): void => { //0xF7: /* STB - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteByte(usAddr, this.regB);
    this.regCC &= ~(F.ZERO | F.NEGATIVE | F.OVERFLOW);
    this._flagnz(this.regB);
  }

  private eorbe = (): void => { //0xF8: /* EORB - extended */
    const usAddr = this.nextPCWord();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._eor(this.regB, ucTemp);
  }

  private adcbe = (): void => { //0xF9: /* ADCB - extended */
    const usAddr = this.nextPCWord();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._adc(this.regB, ucTemp);
  }

  private orbe = (): void => { //0xFA: /* ORB - extended */
    const usAddr = this.nextPCWord();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._or(this.regB, ucTemp);
  }

  private addbe = (): void => { //0xFB: /* ADDB - extended */
    const usAddr = this.nextPCWord();
    const ucTemp = this.M6809ReadByte(usAddr);
    this.regB = this._add(this.regB, ucTemp);
  }

  private ldde = (): void => { //0xFC: /* LDD - extended */
    const usAddr = this.nextPCWord();
    const val = this.M6809ReadWord(usAddr);
    this.setRegD(val);
    this._flagnz16(val);
    this.regCC &= ~F.OVERFLOW;
  }

  private stde = (): void => { //0xFD: /* STD - extended */
    const usAddr = this.nextPCWord();
    const d = this.getRegD();
    this.M6809WriteWord(usAddr, d);
    this._flagnz16(d);
    this.regCC &= ~F.OVERFLOW;
  }

  private ldue = (): void => { //0xFE: /* LDU - extended */
    const usAddr = this.nextPCWord();
    this.regU = this.M6809ReadWord(usAddr);
    this._flagnz16(this.regU);
    this.regCC &= ~F.OVERFLOW;
  }

  private stue = (): void => { //0xFF: /* STU - extended */
    const usAddr = this.nextPCWord();
    this.M6809WriteWord(usAddr, this.regU);
    this._flagnz16(this.regU);
    this.regCC &= ~F.OVERFLOW;
  }

  private instructions: { (): void }[] = [
    this.neg, null, null, this.com, this.lsr, null, this.ror, this.asr, // 00..07
    this.asl, this.rol, this.dec, null, this.inc, this.tst, this.jmp, this.clr, // 08..0f
    this.p10, this.p11, this.nop, this.sync, null, null, this.lbra, this.lbsr, // 10..17
    null, this.daa, this.orcc, null, this.andcc, this.sex, this.exg, this.tfr, // 18..1f
    this.bra, this.brn, this.bhi, this.bls, this.bcc, this.bcs, this.bne, this.beq, // 20..27
    this.bvc, this.bvs, this.bpl, this.bmi, this.bge, this.blt, this.bgt, this.ble, // 28..2f
    this.leax, this.leay, this.leas, this.leau, this.pshs, this.puls, this.pshu, this.pulu, // 30..37
    null, this.rts, this.abx, this.rti, this.cwai, this.mul, null, this.swi, // 38..3f
    this.nega, null, null, this.coma, this.lsra, null, this.rora, this.asra, // 40..47
    this.asla, this.rola, this.deca, null, this.inca, this.tsta, null, this.clra, // 48..4f
    this.negb, null, null, this.comb, this.lsrb, null, this.rorb, this.asrb, // 50..57
    this.aslb, this.rolb, this.decb, null, this.incb, this.tstb, null, this.clrb, // 58..5f
    this.negi, null, null, this.comi, this.lsri, null, this.rori, this.asri, // 60..67
    this.asli, this.roli, this.deci, null, this.inci, this.tsti, this.jmpi, this.clri, // 68..6f
    this.nege, null, null, this.come, this.lsre, null, this.rore, this.asre, // 70..77
    this.asle, this.role, this.dece, null, this.ince, this.tste, this.jmpe, this.clre, // 78..7f
    this.suba, this.cmpa, this.sbca, this.subd, this.anda, this.bita, this.lda, null, // 80..87
    this.eora, this.adca, this.ora, this.adda, this.cmpx, this.bsr, this.ldx, null, // 88..8f
    this.subad, this.cmpad, this.sbcad, this.subdd, this.andad, this.bitad, this.ldad, this.stad, // 90..97
    this.eorad, this.adcad, this.orad, this.addad, this.cmpxd, this.jsrd, this.ldxd, this.stxd, // 98..9f
    this.subax, this.cmpax, this.sbcax, this.subdx, this.andax, this.bitax, this.ldax, this.stax, // a0..a7
    this.eorax, this.adcax, this.orax, this.addax, this.cmpxx, this.jsrx, this.ldxx, this.stxx, // a8..af
    this.subae, this.cmpae, this.sbcae, this.subde, this.andae, this.bitae, this.ldae, this.stae, // b0..b7
    this.eorae, this.adcae, this.orae, this.addae, this.cmpxe, this.jsre, this.ldxe, this.stxe, // b8..bf
    this.subb, this.cmpb, this.sbcb, this.addd, this.andb, this.bitb, this.ldb, this.eorb, // c0..c7
    this.eorb, this.adcb, this.orb, this.addb, this.ldd, null, this.ldu, null, // c8..cf
    this.sbbd, this.cmpbd, this.sbcd, this.adddd, this.andbd, this.bitbd, this.ldbd, this.stbd, // d0..d7
    this.eorbd, this.adcbd, this.orbd, this.addbd, this.lddd, this.stdd, this.ldud, this.stud, // d8..df
    this.subbx, this.cmpbx, this.sbcbx, this.adddx, this.andbx, this.bitbx, this.ldbx, this.stbx, // e0..e7
    this.eorbx, this.adcbx, this.orbx, this.addbx, this.lddx, this.stdx, this.ldux, this.stux, // e8..ef
    this.subbe, this.cmpbe, this.sbcbe, this.addde, this.andbe, this.bitbe, this.ldbe, this.stbe, // f0..f7
    this.eorbe, this.adcbe, this.orbe, this.addbe, this.ldde, this.stde, this.ldue, this.stue // f8..ff        
  ];

  public mnemonics: string[] = [
    'neg  ', '     ', '     ', 'com  ', 'lsr  ', '     ', 'ror  ', 'asr  ', // 00..07
    'asl  ', 'rol  ', 'dec  ', '     ', 'inc  ', 'tst  ', 'jmp  ', 'clr  ', // 08..0f
    'p10  ', 'p11  ', 'nop  ', 'sync ', '     ', '     ', 'lbra ', 'lbsr ', // 10..17
    '     ', 'daa  ', 'orcc ', '     ', 'andcc', 'sex  ', 'exg  ', 'tfr  ', // 18..1f
    'bra  ', 'brn  ', 'bhi  ', 'bls  ', 'bcc  ', 'bcs  ', 'bne  ', 'beq  ', // 20..27
    'bvc  ', 'bvs  ', 'bpl  ', 'bmi  ', 'bge  ', 'blt  ', 'bgt  ', 'ble  ', // 28..2f
    'leax ', 'leay ', 'leas ', 'leau ', 'pshs ', 'puls ', 'pshu ', 'pulu ', // 30..37
    '     ', 'rts  ', 'abx  ', 'rti  ', 'cwai ', 'mul  ', '     ', 'swi  ', // 38..3f
    'nega ', '     ', '     ', 'coma ', 'lsra ', '     ', 'rora ', 'asra ', // 40..47
    'asla ', 'rola ', 'deca ', '     ', 'inca ', 'tsta ', '     ', 'clra ', // 48..4f
    'negb ', '     ', '     ', 'comb ', 'lsrb ', '     ', 'rorb ', 'asrb ', // 50..57
    'aslb ', 'rolb ', 'decb ', '     ', 'incb ', 'tstb ', '     ', 'clrb ', // 58..5f
    'negi ', '     ', '     ', 'comi ', 'lsri ', '     ', 'rori ', 'asri ', // 60..67
    'asli ', 'roli ', 'deci ', '     ', 'inci ', 'tsti ', 'jmpi ', 'clri ', // 68..6f
    'nege ', '     ', '     ', 'come ', 'lsre ', '     ', 'rore ', 'asre ', // 70..77
    'asle ', 'role ', 'dece ', '     ', 'ince ', 'tste ', 'jmpe ', 'clre ', // 78..7f
    'suba ', 'cmpa ', 'sbca ', 'subd ', 'anda ', 'bita ', 'lda  ', '     ', // 80..87
    'eora ', 'adca ', 'ora  ', 'adda ', 'cmpx ', 'bsr  ', 'ldx  ', '     ', // 88..8f
    'subad', 'cmpad', 'sbcad', 'subdd', 'andad', 'bitad', 'ldad ', 'stad ', // 90..97
    'eorad', 'adcad', 'orad ', 'addad', 'cmpxd', 'jsrd ', 'ldxd ', 'stxd ', // 98..9f
    'subax', 'cmpax', 'sbcax', 'subdx', 'andax', 'bitax', 'ldax ', 'stax ', // a0..a7
    'eorax', 'adcax', 'orax ', 'addax', 'cmpxx', 'jsrx ', 'ldxx ', 'stxx ', // a8..af
    'subae', 'cmpae', 'sbcae', 'subde', 'andae', 'bitae', 'ldae ', 'stae ', // b0..b7
    'eorae', 'adcae', 'orae ', 'addae', 'cmpxe', 'jsre ', 'ldxe ', 'stxe ', // b8..bf
    'subb ', 'cmpb ', 'sbcb ', 'addd ', 'andb ', 'bitb ', 'ldb  ', 'eorb ', // c0..c7
    'eorb ', 'adcb ', 'orb  ', 'addb ', 'ldd  ', '     ', 'ldu  ', '     ', // c8..cf
    'sbbd ', 'cmpbd', 'sbcd ', 'adddd', 'andbd', 'bitbd', 'ldbd ', 'stbd ', // d0..d7
    'eorbd', 'adcbd', 'orbd ', 'addbd', 'lddd ', 'stdd ', 'ldud ', 'stud ', // d8..df
    'subbx', 'cmpbx', 'sbcbx', 'adddx', 'andbx', 'bitbx', 'ldbx ', 'stbx ', // e0..e7
    'eorbx', 'adcbx', 'orbx ', 'addbx', 'lddx ', 'stdx ', 'ldux ', 'stux ', // e8..ef
    'subbe', 'cmpbe', 'sbcbe', 'addde', 'andbe', 'bitbe', 'ldbe ', 'stbe ', // f0..f7
    'eorbe', 'adcbe', 'orbe ', 'addbe', 'ldde ', 'stde ', 'ldue ', 'stue ' // f8..ff        
  ];
}
