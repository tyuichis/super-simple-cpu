import { displayFormattedIOInput } from "./ui/io-input.js";

import {
  formatMemoryInput,
  getRawInput,
  convertInputBinaryToDecimal,
  displayMemorySubtitles,
  preventNonBinaryDigits,
} from "./ui/memoryView.js";

import { getMemoryCells, saveMemoryFile } from "./utils/saveMemory.js";
import { getJSONSaveData, loadMemory } from "./utils/loadMemory.js";
import { clearApp } from "./utils/clearApp.js";

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

saveButton.addEventListener("click", async () => {
  try {
    await saveMemoryFile();
  } catch (error) {
    console.error("Save failed:", error);
  }
});

// Debug
// saveButton.addEventListener("click", () => {
//   console.log(getMemoryCells());
// });

const loadButton = document.getElementById("app-load");

loadButton.addEventListener("click", () => {
  loadMemory();
});

const clearButton = document.getElementById("app-clear");
clearButton.addEventListener("click", () => {
  const userConsent = window.confirm(
    "Do you really want to clear the WHOLE app? Resets to default."
  );

  if (userConsent) {
    clearApp();
  }
});

// IO eventListeners

const ioInputButton = document.getElementById('io-input');

ioInputButton.addEventListener('input', (e) => {
    // pass the element directly into the formatter.
    displayFormattedIOInput(e.target);
})

// Memory View eventListeners
for (let i = 0; i <= 15; i++) {
  const inputElement = document.getElementById(`mem-val-${i}`);

  inputElement.addEventListener("input", (e) => {
    // Get, sanitize and format user input
    const rawInput = getRawInput(e.target.value);
    const sanitizedInput = preventNonBinaryDigits(rawInput);
    const formattedString = formatMemoryInput(sanitizedInput);

    // Display valid input
    e.target.value = formattedString;

    // Display the decoded instruction as a subtitle

    const instructionElement = document.getElementById(`mem-val-${i}-asm`);
    const inputInstructionBinary = rawInput.slice(0, 4);
    const inputOperandBinary = rawInput.slice(4);

    displayMemorySubtitles(
      inputInstructionBinary,
      inputOperandBinary,
      instructionElement,
      OPCODES
    );
  });
}

// console.log(getMemoryCells());

/* For OPcodes; allow words to be clicked and focus specific inputs on the app

Example: clicking on 'accumulator' within an OPcode explanation, focuses on the actual accumulator input
 */
document.querySelectorAll(".focus-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const targetId = trigger.dataset.target;
    const targetElement = document.getElementById(targetId);

    // Remove class first (in case it's already animating)
    targetElement.classList.remove("pulse-blue");

    // Force reflow to restart animation
    void targetElement.offsetWidth;

    // Add it back
    targetElement.classList.add("pulse-blue");

    // Remove after animation completes
    targetElement.addEventListener(
      "animationend",
      () => {
        targetElement.classList.remove("pulse-blue");
      },
      { once: true }
    ); // { once: true } auto-removes the listener
  });
});
