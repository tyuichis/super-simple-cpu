/* Decode and parse the binary into its ASM form

Includes two's complement in parentheses IF the number is negative.

 */

import { convertBinaryToDecimal } from "./binary.js";
import {
  OPCODES,
  INSTRUCTION_SIZE,
  MNEMONICS,
  NO_OPERAND_INSTRUCTIONS,
  ADDRESS_MODE_INSTRUCTIONS,
  MEMORY_SIZE,
} from "./constants.js";

/**
 * decodeInstruction
 *
 * Convert raw memory content binary value to ASM instruction
 *
 * 0000010000000000 → DAT (1024) // 1024 is excluded, handled by decodeOperand
 *
 * The leading bits are decoupled; it's up to the caller to decide
 * what are the leading bits (i.e. controller), or constants,
 * if ever I want to increase the instruction size to be 8 bits or whatever.
 *
 * @param {string} binary
 * @returns {string} instruction
 */

function decodeInstruction(binary) {
  const memoryBin = binary;

  // console.log(`decodeInstruction: ${binary}`);
  // incomplete instruction
  if (memoryBin.length < INSTRUCTION_SIZE) {
    return "";
  }

  // If we accidentally called decodeInstruction with the
  // full memory-size binary, then just take the first 4 bits.
  if (memoryBin.length > INSTRUCTION_SIZE) {
    memoryBin = memoryBin.slice(0, INSTRUCTION_SIZE);
  }

  if (!OPCODES.has(memoryBin)) {
    return "Invalid Opcode";
  }

  const instruction = OPCODES.get(memoryBin);

  return instruction;
}

/**
 * decodeOperand
 * 
 * Interprets the operand based on the instruction given.
 *
 * @param {*} instruction
 * The instruction in assembly, i.e. "LOD". It should already be decoded before
 * passing it to this function.
 *
 * @param {string} binary
 * Raw binary value
 *
 * @returns {string}
 * The operand is to be interpreted as either:
 * - an address
 * - an unsigned value + optionally, signed value if negative
 * - none (as instruction doesn't require it.)
 *
 */

function decodeOperand(instruction, binary) {
  // console.log(instruction);
  const validInstruction = MNEMONICS.get(instruction);
  if (!validInstruction) {
    // console.log('this is fired.')
    return "";
  }

  if (!binary) {
    return "";
  }

  if (instruction === "DAT" && !binary) {
    return "";
  }

  const paddedBinary = binary.padEnd(MEMORY_SIZE - INSTRUCTION_SIZE, "0");

  // interpret our instruction...
  // const instruction = OPCODES.get(instructionBinary);
  const noOperand = NO_OPERAND_INSTRUCTIONS.has(instruction);
  const isAddressMode = ADDRESS_MODE_INSTRUCTIONS.has(instruction);

  if (noOperand) {
    return "";
  } else if (isAddressMode) {
    // console.log(`binary?: ${paddedBinary}`);
    const address = parseInt(paddedBinary, 2);
    // console.log(`address?: ${address}`)
    return address;
  } else {
    const unsigned = parseInt(binary, 2);
    const signed = convertBinaryToDecimal(paddedBinary);
    // This should coerce `signed` to Number type when checking.
    if (Math.sign(signed) === -1) {
      // i.e. 0010 1000 0000 0000 → SUB 2048 (-2048)
      // Most significant bit is "1", so interpret as negative num in two's complement
      return `${unsigned} (${signed})`;
    } else {
      // i.e. 0010 0000 0000 0001 → SUB 1
      // Not a negative number, so omit the negative part
      return unsigned;
    }
  }
}

function decodeAssembly(bin) {
    const instructionBin = bin.slice(0, 4);
    const instruction = decodeInstruction(instructionBin);
    const operandBin = bin.slice(4);
    const operand = decodeOperand(instruction, operandBin);
    return [instruction, operand];
}

export { decodeInstruction, decodeOperand, decodeAssembly };
