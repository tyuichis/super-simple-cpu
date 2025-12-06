/* Uses the File System API to load a JSON file containing our memory cell
 */

import { MEMORY_SIZE } from "./constants.js";

import { getRawInput } from "../ui/inputDisplay.js";
import { decodeInstruction, decodeOperand } from "./decode.js";

async function getJSONSaveData() {
  try {
    if ("showOpenFilePicker" in window) {
      const jsonOption = {
        types: [
          {
            description: "JSON file",
            accept: {
              "application/json": [".json"],
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      };

      const [jsonHandle] = await window.showOpenFilePicker(jsonOption);
      const jsonData = await jsonHandle.getFile();
      const jsonText = await jsonData.text();
      return JSON.parse(jsonText);
    } else {
      // Handle fallback for Firefox... and other browsers that
      // don't fully support the File System API
      return new Promise((resolve, reject) => {
        // create pseudo-elements that have 'file' type
        // that force the browser to pick a file
        const loadInput = document.createElement("input");
        loadInput.type = "file";
        loadInput.accept = ".json,application/json";

        // load and parse the json file
        loadInput.onchange = async (event) => {
          // this could be multiple files that aren't JSON
          const jsonFile = event.target.files[0];

          if (!jsonFile) {
            reject(new Error("No file was selected"));
            return;
          }

          try {
            // jsonText refers to the literal text content of the (JSON) file.
            const jsonText = await jsonFile.text();
            resolve(JSON.parse(jsonText));
          } catch (error) {
            reject("Invalid JSON?");
          }
        };

        loadInput.oncancel = () => {
          resolve(null);
        };

        loadInput.click();
      });
    }
  } catch (error) {
    if (error.name === "AbortError") {
      return null;
    }
    console.error("Something wrong occured while loading JSON", error);
  }
}

async function loadMemory() {
  try {
    const memoryCells = await getJSONSaveData();

    for (let i = 0; i < MEMORY_SIZE; i++) {
      const memAddrLabel = document.getElementById(`mem-addr-label-${i}`);
      const memAddr = document.getElementById(`mem-addr-${i}`);
      const memVal = document.getElementById(`mem-val-${i}`);

      memAddrLabel.value = memoryCells[i]["mem-addr-label"];
      memAddr.value = memoryCells[i]["mem-addr"];
      memVal.value = memoryCells[i]["mem-val"];

      // decode and set memory cell asm
      const memoryBin = getRawInput(memoryCells[i]["mem-val"]);
      const instructionBin = memoryBin.slice(0, 4);
      const instruction = decodeInstruction(instructionBin);
      const operandBin = memoryBin.slice(4);
      const operand = decodeOperand(instruction, operandBin);

      const memInstruction = document.getElementById(
        `mem-val-${i}-instruction`
      );
      const memOperand = document.getElementById(`mem-val-${i}-operand`);

      memInstruction.textContent = instruction || "";
      memOperand.textContent = operand || "";
    }
  } catch (error) {
    console.error("Something wrong happened while loading memory", error);
  }
}

export { getJSONSaveData, loadMemory };
