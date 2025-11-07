/* Displays subtitles for the CPU registers input fields (readonly)
 */

// Each subtitle has slightly different logic, because of how the data is interpreted

import { OPCODES } from "../utils/constants";
import { getRawInput } from "./inputDisplay.js";

function displayPCSubtitle() {
  const pcInputElement = document.getElementById("reg-val-pc");
  const pcInputVal = pcInputElement.value;
  const pcSubtitleElement = document.getElementById("reg-val-pc-asm");
  const instructionType = "ADDR";

  const decimalValue = parseInt(pcInputVal, 2);

  pcSubtitleElement.textContent = `${instructionType} ${decimalValue}`;
  // 0000 0000 0111 in the PC input field becomes the subtitle:
  // → ADDR 7
}

function displayAccSubtitle() {
  const accInputElement = document.getElementById("reg-val-acc");
  const accInputVal = accInputElement.value;
  const accSubtitleElement = document.getElementById("reg-val-acc-asm");
  const instructionType = "DAT";

  const decimalValue = parseInt(accInputVal, 2);

  accSubtitleElement.textContent = `${instructionType} ${decimalValue}`;
  // 0000 0000 1010 in the acc input field becomes the subtitle:
  // → DAT 10
}

// displayTempSubtitle ... not sure how temp works, as it was never used.

function displayIRSubtitle() {
  // should be handled same as a memory cell.

  const instructionElement = document.getElementById("reg-val-ir-asm");
  const instructionRegisterVal = document.getElementById("reg-val-ir");
  const rawInput = getRawInput(instructionRegisterVal.value);

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
    const opcode = OPCODES.get(inputInstructionBinary);
    instructionElement.textContent = `${opcode} ${decimalValue}`;
  } else if (inputInstructionBinary.length == 4) {
    instructionElement.textContent = "Invalid Opcode";
  } else {
    instructionElement.textContent = "";
  }
}

export { displayPCSubtitle, displayAccSubtitle, displayIRSubtitle };
