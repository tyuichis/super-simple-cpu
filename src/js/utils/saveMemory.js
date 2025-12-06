/*
Get all of the values within the memory cells, convert to JSON string
then save as a JSON file.
*/

import { MEMORY_SIZE } from "./constants.js";

import { FileSaver } from "./fileSaver.js";

function getMemoryCells() {
  // mem-addr-label-[i] : String,
  // mem-addr-[i] : String,
  // mem-val-[i]: String

  // need to format mem-val-[i] to remove the spaces

  const memory = [];
  for (let i = 0; i < MEMORY_SIZE; i++) {
    const memAddrLabel = document.getElementById(`mem-addr-label-${i}`);
    const memAddr = document.getElementById(`mem-addr-${i}`);
    const memVal = document.getElementById(`mem-val-${i}`);

    const memoryCell = {
      "mem-addr-label": memAddrLabel.value ?? "",
      "mem-addr": memAddr.value ?? "",
      "mem-val": memVal.value ?? "",
    };

    memory.push(memoryCell);
  }

  return memory;
}

// To-do, also save registers?
async function saveMemoryFile() {
  const fileName = `memoryData-${Date.now()}.json`;

  const data = getMemoryCells();

  await FileSaver.saveJSON(data, fileName);
}

export { getMemoryCells, saveMemoryFile };
