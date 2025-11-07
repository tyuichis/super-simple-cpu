/* Clear every slot in the memory to its default
 */

import { MEMORY_SIZE } from "./constants.js";

function clearIO() {
  const ioInput = document.getElementById("io-input");
  const ioOutput = document.getElementById("io-output");
  ioInput.value = "";
  ioOutput.value = "";
}

function clearMemory() {
  for (let i = 0; i <= MEMORY_SIZE - 1; i++) {
    const memAddrLabel = document.getElementById(`mem-addr-label-${i}`);
    const memAddr = document.getElementById(`mem-addr-${i}`);
    const memVal = document.getElementById(`mem-val-${i}`);
    const memValInstruction = document.getElementById(`mem-val-${i}-asm`);

    memAddrLabel.value = "";
    memAddr.value = "";
    memVal.value = "";
    memValInstruction.textContent = "";
  }
}

function clearCPURegisters() {
  document.querySelectorAll("#cpu input").forEach((input) => {
    input.value = "";
  });
}

function clearApp() {
  clearIO();
  clearMemory();
  clearCPURegisters();
}

export { clearIO, clearMemory, clearCPURegisters, clearApp };
