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
    const memAddrLabel = document.querySelector(`#mem-addr-label-${i} label`);
    const memAddr = document.getElementById(`mem-addr-${i}`);
    const memVal = document.getElementById(`mem-val-${i}`);
    const memInstruction = document.getElementById(`mem-val-${i}-instruction`);

    const memOperand = document.getElementById(`mem-val-${i}-operand`);

    memAddrLabel.textContent = "";
    memAddr.value = "";
    memVal.value = "";
    memInstruction.textContent = "";
    memOperand.textContent = "";
  }
}

function clearCPURegisters() {
  document.querySelectorAll("#cpu input").forEach((input) => {
    if (input.id === "reg-val-pc") {
      input.value = "0";
    } else {
      input.value = "";
    }
  });

  // clear assembly
  document.getElementById("reg-val-acc-asm-current").textContent = "0";
  document.getElementById("reg-val-ir-asm-instruction").textContent = "";
  document.getElementById("reg-val-ir-asm-current").textContent = "";
}

function clearApp() {
  clearIO();
  clearMemory();
  clearCPURegisters();
}

export { clearIO, clearMemory, clearCPURegisters, clearApp };
