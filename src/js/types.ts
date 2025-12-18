/**
 * Type definitions for data within our CPU
 */

/** Binary string representation (e.g., "00001111") */
export type BinaryString = string;

/** Decimal string representation (e.g., "15" or "-3") */
export type DecimalString = string;

/** Program Counter - used as decimal (for easier memory accesses) */
export type ProgramCounter = DecimalString;

/** Accumulator value - stored/passed as binary string */
export type Accumulator = BinaryString;

/** Memory address - used as decimal (for easier memory accesses) */
export type MemoryAddress = DecimalString;

/** Memory value - stored/passed as binary string */
export type MemoryValue = BinaryString;

/** Operand value - binary string */
export type Operand = BinaryString;

/** Full instruction as binary string (opcode + operand) */
export type InstructionBinary = string;

/** Opcode - raw binary value of the instruction (4-bit) */
export type Opcode =
  | "0000"
  | "0001"
  | "0010"
  | "0011"
  | "0100"
  | "0101"
  | "0110"
  | "0111"
  | "1000"
  | "1001"
  | "1010"
  | "1011"
  | "1100"
  | "1101"
  | "1110"
  | "1111";

// alias for Opcode
export type OpcodeBinary = Opcode;

/** Mnemonic - assembly interpretation of the opcode */
export type Mnemonic =
  | "STP"
  | "ADD"
  | "SUB"
  | "LOD"
  | "LDI"
  | "STO"
  | "INP"
  | "OUT"
  | "JMP"
  | "JNG"
  | "JZR"
  | "DAT";
