//  TO-DO: Fix input cursor jankiness (QoL) for inputs that format text:
// → memoryView, io-input...

// TO-DO: On next step button execution, create an anchor link w/ fragment id
// and click on it to force the viewport to jump to the correct address.

import { displayFormattedIOInput } from "./ui/io-input.js";

import { displayExample } from "./ui/loadExample.js";

import { displayTabView } from "./ui/tabView.js";

import {
  formatMemoryInput,
  getRawInput,
  convertInputBinaryToDecimal,
  displayMemorySubtitle,
  preventNonBinaryDigits,
} from "./ui/memoryView.js";

import { getMemoryCells, saveMemoryFile } from "./utils/saveMemory.js";
import { getJSONSaveData, loadMemory } from "./utils/loadMemory.js";
import {
  clearIO,
  clearMemory,
  clearCPURegisters,
  clearApp,
} from "./utils/clearApp.js";

// TO-DO: Refactor OPCODES to be only called within the function that calls it (i.e. memoryView)
import { OPCODES, MEMORY_SIZE } from "./utils/constants.js";

import { EXAMPLE_LIST } from "./utils/exampleList.js";

/*
Variables
*/

// memory labels defined by user or examples
const LABELS = new Map();

/*
eventListeners
*/

// Load Examples eventListeners

const exampleOptionSelector = document.getElementById("memory-examples");

exampleOptionSelector.addEventListener("change", (e) => {
  const optionValue = e.target.value;
  if (optionValue !== 0) {
    clearMemory();

    const selectedExample = EXAMPLE_LIST[optionValue - 1];

    displayExample(selectedExample);

    // Same memory view update.

    for (let i = 0; i <= MEMORY_SIZE - 1; i++) {
      const memoryVal = document.getElementById(`mem-val-${i}`);
      const rawInput = getRawInput(memoryVal.value);

      // update the memory cell formatting.
      memoryVal.value = formatMemoryInput(rawInput);
      // update the subtitle based on the new memory cell value
      displayMemorySubtitle(i);
    }
  }
});

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

loadButton.addEventListener("click", async () => {
  try {
    // wait for JSON load to finish
    await loadMemory();

    // then update our input fields in the memoryView

    for (let i = 0; i <= MEMORY_SIZE - 1; i++) {
      displayMemorySubtitle(i);
    }
  } catch (error) {
    console.error(`Something wrong happened while loading memory: ${error}`);
  }
});

// Clear app memory eventListener
const clearButton = document.getElementById("app-clear");
clearButton.addEventListener("click", () => {
  const userConsent = window.confirm(
    "Do you really want to clear the app's memory?"
  );

  if (userConsent) {
    clearApp();
  }
});

// IO eventListeners

const ioInputButton = document.getElementById("io-input");

ioInputButton.addEventListener("input", (e) => {
  // pass the element directly into the formatter.
  displayFormattedIOInput(e.target);
});

// Memory View eventListeners
for (let i = 0; i <= MEMORY_SIZE - 1; i++) {
  const inputElement = document.getElementById(`mem-val-${i}`);

  inputElement.addEventListener("input", (e) => {
    // Get, sanitize and format user input
    const rawInput = getRawInput(e.target.value);
    const sanitizedInput = preventNonBinaryDigits(rawInput);
    const formattedString = formatMemoryInput(sanitizedInput);

    // Display valid input
    e.target.value = formattedString;

    // Display the decoded instruction as a subtitle
    displayMemorySubtitle(i);
  });
}

// console.log(getMemoryCells());

/* For OPcodes; allow words to be clicked and focus specific inputs on the app

Example: clicking on 'accumulator' within an OPcode explanation, focuses on the actual accumulator input
 */

// TO-DO: Refactor/remake this test code. I don't remember adding this. Copilot may have modified the original accidentally??
document.querySelectorAll(".focus-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const targetId = trigger.dataset.target;
    const targetElement = document.getElementById(targetId);

    targetElement.classList.remove("pulse-blue");

    void targetElement.offsetWidth;

    targetElement.classList.add("pulse-blue");

    targetElement.addEventListener(
      "animationend",
      () => {
        targetElement.classList.remove("pulse-blue");
      },
      { once: true }
    );
  });
});

// Navigation tab eventListener

document.querySelectorAll("#nav-view button").forEach((tabButton) => {
  tabButton.addEventListener("click", (e) => {
    displayTabView(e.target);
  });
});
