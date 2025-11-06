import {
  formatInput,
  getRawInput,
  convertInputBinaryToDecimal,
  preventNonBinaryDigits,
} from "./ui/memoryView.js";

import { getMemoryCells, saveMemoryFile } from "./utils/saveMemory.js";

// variables
const OPCODES = new Map([
  ["1111", "STP"],
  ["0001", "ADD"],
  ["0010", "SUB"],
  ["0011", "LOD"],
  ["0101", "STO"],
  ["0110", "INP"],
  ["0111", "OUT"],
  ["1000", "JMP"],
  ["1001", "JNG"],
  ["1010", "JZR"],
]);

// memory labels defined by user or examples
const LABELS = new Map();

// setup eventListeners

// Saving

const saveButton = document.getElementById("app-save");

// saveButton.addEventListener("click", async () => {
//   try {
//     await saveMemoryFile();
//   } catch (error) {
//     console.error("Save failed:", error);
//   }
// });

saveButton.addEventListener("click", () => {
  console.log(getMemoryCells());
});

// Memory View eventListeners
for (let i = 0; i <= 15; i++) {
  const inputElement = document.getElementById(`mem-val-${i}`);

  inputElement.addEventListener("input", (e) => {
    // Get, sanitize and format user input
    const rawInput = getRawInput(e.target.value);
    const sanitizedInput = preventNonBinaryDigits(rawInput);
    const formattedString = formatInput(sanitizedInput);

    // Display valid input
    e.target.value = formattedString;

    // Display the decoded instruction as a subtitle

    const instructionElement = document.getElementById(`mem-val-${i}-asm`);
    const inputInstructionBinary = rawInput.slice(0, 4);
    const inputOperandBinary = rawInput.slice(4);

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
  });
}
// console.log(getMemoryCells());
