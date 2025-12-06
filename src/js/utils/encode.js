/*

Convert ASM to binary! Wahoo!

 */

// Use MNEMONICS from constants to get ASM → BIN
// replace empty lines with 0000's <MEMORY_SIZE>
// then, when we successfully convert it, copy it to memory.
    // throw an error somewhere if invalid OPcode.

import { MNEMONICS } from "./constants.js"

import { convertDecimalToBinary } from "./binary.js";

/**
 * encodeInstruction
 * 
 * Gives back the binary of the instruction
 * 
 * @returns {string} binary
 * 
 */

function encodeInstruction(instruction) {
    return MNEMONICS.get(instruction);
}

function encodeOperand(operand) {
    const binary = convertDecimalToBinary(operand).slice(4);
    return binary;
}


export {encodeInstruction, encodeOperand}