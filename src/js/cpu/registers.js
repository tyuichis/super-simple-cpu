/* Manage register state

This Super Simple CPU has these 4 registers:

- Program counter (PC)
- Accumulator (acc)
- Temp ?
- Instruction register (IR)

 */

// Still don't know what temp is for, so no support for now

// Probably some utility/UI import here.

import { animateValChange } from "../ui/animate.js";

import { MEMORY_SIZE } from "../utils/constants.js";

import {
  decodeInstruction,
  decodeOperand,
  decodeAssembly,
} from "../utils/decode.js";

// TO-DO, probably refactor this...
import { displayASMValue } from "../ui/inputDisplay.js";

import { formatBinaryWithPadding } from "../ui/inputDisplay.js";

/*

Model - handles internal data/state

View - displays model values

Controller - handles coordination between internal state (model) and display (view). 
Should also decode any instructions. before view displays them.

*/

// Similar structure as memory model; same sort of structure.
class RegisterModel {
  /*
  Manage register states:

  - Program Counter
  - Accumulator
  - Instruction Register

  where each cell is of identical structure, but interpretation of values is different,

  where
  Program Counter should always be interpreted as an address.
  Accumulator should always be interpreted as raw data
  Instruction Register gets treated like a memory cell.
  */

  #pc_register;
  #acc_register; // should be 12 bits...?
  #ir_register;

  constructor() {
    const initialBinary = "".padStart(MEMORY_SIZE, "0");
    const initialOperand = "".padStart(MEMORY_SIZE - 4, "0");

    this.#pc_register = {
      value: initialBinary,
    };

    this.#acc_register = {
      value: initialOperand,
    };

    this.#ir_register = {
      value: initialBinary,
    };
  }

  // Model: Program Counter Register
  setPCValue(value) {
    this.#pc_register.value = value;
  }

  getPCValue() {
    return this.#pc_register.value;
  }

  getPCAddress() {
    // return it as a (positive) decimal number
    return parseInt(this.#pc_register.value, 2);
  }

  // Model: Accumulator Register
  setACCValue(value) {
    this.#acc_register.value = value;
  }

  getACCValue() {
    return this.#acc_register.value;
  }

  // Model: Instruction Register
  setIRValue(value) {
    this.#ir_register.value = value;
  }

  getIRValue() {
    return this.#ir_register.value;
  }
}

class RegisterView {
  #pc_register;
  #pc_register_label;
  #pc_register_address;

  #acc_register;
  #acc_register_asm_value;

  #ir_register;
  #ir_register_asm_instruction;
  #ir_register_asm_value;

  constructor() {
    /*
    PC Register only needs to update:
    - registry value,
    - address label (PC is ALWAYS interpreted as an address),
    - address value
    */
    this.#pc_register = document.getElementById("reg-val-pc");
    this.#pc_register_label = document.getElementById("reg-pc-label");
    this.#pc_register_address = document.getElementById(
      "reg-val-pc-asm-current"
    );

    /*
    Accumulator register only needs to update:
    - registry value,
    - assembly value (always DAT)
    */
    this.#acc_register = document.getElementById("reg-val-acc");
    this.#acc_register_asm_value = document.getElementById(
      "reg-val-acc-asm-current"
    );

    /*
    The Instruction Register is like a memory cell, so it needs to target:
    - registry value,
    - assembly instructions
    - assembly value ( decimal / two's complement side by side)
    */
    this.#ir_register = document.getElementById("reg-val-ir");
    this.#ir_register_asm_instruction = document.getElementById(
      "reg-val-ir-asm-instruction"
    );
    this.#ir_register_asm_value = document.getElementById(
      "reg-val-ir-asm-current"
    );
  }

  // View: Program Counter Register
  // Animate input box value changes (NOT for asm)
  async setPCValue(value) {
    // add row border to table as additional visual aid
    const programCounter = document.getElementById("program-counter");
    await this.#setActiveRegister(programCounter);

    const formattedValue = formatBinaryWithPadding(value);
    await animateValChange(this.#pc_register, formattedValue);
  }

  setPCLabel(label) {
    this.#pc_register_label.textContent = label;
  }

  setPCAddress(address) {
    this.#pc_register_address.textContent = address;
  }

  // View: Accumulator Register
  // Animate input box value changes (NOT for asm)
  async setACCValue(value) {
    // add row border to table as additional visual aid
    const accumulator = document.getElementById("accumulator");
    await this.#setActiveRegister(accumulator);

    const formattedValue = formatBinaryWithPadding(value);
    await animateValChange(this.#acc_register, formattedValue);
  }

  setACCASMInstruction(instruction) {
    this.#acc_register_asm_value.textContent = instruction;
  }

  setACCASMOperand(value) {
    this.#acc_register_asm_value.textContent = value;
  }

  // View: Instruction Register
  // Animate input box value changes (NOT for asm)
  async setIRValue(value) {
    // add row border to table as additional visual aid
    this.#clearActiveRegisterVisual();
    const instructionRegister = document.getElementById("instruction-register");
    await this.#setActiveRegister(instructionRegister);

    const formattedValue = formatBinaryWithPadding(value);
    await animateValChange(this.#ir_register, formattedValue);
  }

  setIRASMInstruction(instruction) {
    this.#ir_register_asm_instruction.textContent = instruction;
  }

  setIRASMValue(value) {
    this.#ir_register_asm_value.textContent = value;
  }

  async #setActiveRegister(registerElement) {
    // needs to be async because I get race conditions again.
    return new Promise((resolve) => {
      this.#clearActiveRegisterVisual();
      registerElement.classList.add("register-active");
      resolve();
    });
  }
  // utility functions to clear UI
  #clearActiveRegisterVisual() {
    const programCounterRow = document.getElementById("program-counter");
    const accumulatorRow = document.getElementById("accumulator");
    const instructionRegisterRow = document.getElementById(
      "instruction-register"
    );

    [programCounterRow, accumulatorRow, instructionRegisterRow].forEach(
      (row) => {
        row.classList.remove("register-active");
      }
    );
  }
}

class RegisterController {
  #model;
  #view;

  constructor() {
    this.#model = new RegisterModel();
    this.#view = new RegisterView();
  }

  // this should only be the raw value, since we're
  // getting this value from the memory view (no user inputs)
  async setPCValue(rawBinaryValue) {
    // 1. set model value
    this.#model.setPCValue(rawBinaryValue);

    // 2. sync with view
    await this.#syncPCView();
  }

  getPCAddress() {
    return this.#model.getPCAddress();
  }

  async #syncPCView() {
    const pcBinary = this.#model.getPCValue();
    const pc = this.#model.getPCAddress();

    // TO-DO: make LABEL logic; this is from the assembler window

    await this.#view.setPCValue(pcBinary);
    this.#view.setPCAddress(pc);
  }

  async setACCValue(rawBinaryValue) {
    // 1. update model value
    this.#model.setACCValue(rawBinaryValue);

    // 2. sync with view
    await this.#syncACCView();
  }

  async #syncACCView() {
    const accBinary = this.#model.getACCValue();

    const [instruction, operand] = decodeAssembly(accBinary);

    // update ASM first, then play animation on the acc input element.
    this.#view.setACCASMInstruction(instruction);
    this.#view.setACCASMOperand(operand);

    await this.#view.setACCValue(accBinary);
  }

  // expose acc for ALU/CPU
  getACCValue() {
    return this.#model.getACCValue();
  }

  async setIRValue(rawBinaryValue) {
    // 1. update model value
    this.#model.setIRValue(rawBinaryValue);

    // 2. sync with view
    await this.#syncIRView();
  }

  async #syncIRView() {
    const bin = this.#model.getIRValue();

    const instructionBin = bin.slice(0, 4);
    const instruction = decodeInstruction(instructionBin);
    const operandBin = bin.slice(4);
    const operand = decodeOperand(instruction, operandBin);

    // update ASM first
    this.#view.setIRASMInstruction(instruction);
    this.#view.setIRASMValue(operand);

    //then flash input
    await this.#view.setIRValue(bin);
  }

  decode;
}

export { RegisterController };
