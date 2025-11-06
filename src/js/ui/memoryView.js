import { getRawInput, preventNonBinaryDigits } from "./inputDisplay.js";

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

function displayMemorySubtitles(
  inputInstructionBinary,
  inputOperandBinary,
  instructionElement,
  OPCODES
) {
  /* Displays OPCODE and decimal value underneath the memory value input.
   */

  const decimalValue =
    inputOperandBinary.length == 12
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
  displayMemorySubtitles,
};
