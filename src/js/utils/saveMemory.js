/*
Get all of the values within the memory cells, convert to JSON string
then save as a JSON file.
*/

import { formatMemoryInput } from "../ui/memoryView.js";

function getMemoryCells() {
  // mem-addr-label-[i] : String,
  // mem-addr-[i] : String,
  // mem-val-[i]: String

  // need to format mem-val-[i] to remove the spaces

  const memory = [];

  for (let i = 0; i <= 15; i++) {
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

async function saveMemoryFile() {
  const fileName = `memoryData-${Date.now()}.json`;

  const jsonData = JSON.stringify(getMemoryCells());

  if ("showSaveFilePicker" in window) {
    try {
      const fileHandler = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "Memory JSON",
            accept: { "application/json": [".json"] },
          },
        ],
      });

      const writable = await fileHandler.createWritable();
      await writable.write(jsonData);
      await writable.close();
      return;
    } catch (error) {
      // MUST handle abort error, otherwise canceling file save still downloads the file.
      if (error.name === "AbortError") {
        return;
      }

      console.error("Something went wrong saving.");
    }
  }

  // fallback since Firefox doesn't support the saveFilePicker

  // blob is the raw binary data
  const blob = new Blob([jsonData], { type: "application/json" });

  // make a URL for this bloberino
  const downloadURL = URL.createObjectURL(blob);

  // create an element and immediately click on it to activate the download process.
  const downloadURLElement = document.createElement("a");
  downloadURLElement.href = downloadURL;
  downloadURLElement.download = fileName;
  downloadURLElement.click();

  // cleanup URL reference
  URL.revokeObjectURL(downloadURL);
}

export { getMemoryCells, saveMemoryFile };
