import { getRawInput, preventNonBinaryDigits } from "./inputDisplay.js";

import { OPCODES, MEMORY_SIZE } from "../utils/constants.js";

/* Helper Functions */

function formatMemoryInput(rawInput) {
  /* Adds a space every 4 digits (max: 3 spaces for a 16 bit number)
   */
  let formattedString = "";

  for (let i = 0; i < rawInput.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedString += " ";
    }
    formattedString += rawInput[i];
  }

  return formattedString;
}

function convertInputBinaryToDecimal(inputOperandBinary) {
  const sign = inputOperandBinary[0];
  // parseInt(string, baseY) converts to base 10
  const value = parseInt(inputOperandBinary.slice(1), 2);

  if (sign == "1") {
    return String(-1 * value);
  } else {
    return String(value);
  }
}

function displayMemorySubtitle(idIndex) {
  /* Displays OPCODE and decimal value underneath the memory value input.

  @idIndex is the hardcoded id of the memory cell, i.e.

  mem-val-${i}
  mem-val-${i}-asm

  In general, display OPcode with status:
  Valid OPcode OR invalid Opcode
  Else hide.

  In general, display operand when:
  Valid OPCode AND OPcode expects operand
  ELSE hide.

    If 0000 0000 0000 0000 → Display nothing; default state (no OPcode, operand)
    If 0000 0000 0000 0001 → Display DAT 1 (no OPcode)
    If 1111 0000 0000 0001 → Display STP (Valid OPcode, but does not expect operand; ignore operand)
    If 0001 0000 0000 0001 → Display ADD 1 (Valid OPcode, include operand)
   */

  const instructionElement = document.getElementById(`mem-val-${idIndex}-asm`);
  const memoryVal = document.getElementById(`mem-val-${idIndex}`);
  const rawInput = getRawInput(memoryVal.value);
  const inputInstructionBinary = rawInput.slice(0, 4);
  const inputOperandBinary = rawInput.slice(4);

  const decimalValue =
  // Subtract 4 leading bits from the length.
    inputOperandBinary.length == MEMORY_SIZE - 4
      ? convertInputBinaryToDecimal(inputOperandBinary)
      : "";

  if (inputInstructionBinary.length < 4) {
    instructionElement.textContent = "";
  }

  // Display the OP code as a subtitle
  if (
    inputInstructionBinary.length == 4 &&
    OPCODES.has(inputInstructionBinary)
  ) {
    instructionElement.textContent = `${OPCODES.get(
      inputInstructionBinary
    )} ${decimalValue}`;
  } else if (inputInstructionBinary.length == 4) {
    instructionElement.textContent = "Invalid Opcode";
  } else {
    instructionElement.textContent = "";
  }
}

// Not needed, as base 10 label is redundant since the decimal
// value shows up within the memory subtitle
// function updateMemoryDecimal() {
//   /* Updates the decimal labels to the correct value.
//    */
// }

export {
  getRawInput,
  preventNonBinaryDigits,
  formatMemoryInput,
  convertInputBinaryToDecimal,
  displayMemorySubtitle,
};
