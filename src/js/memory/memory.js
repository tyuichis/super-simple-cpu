/* Manage memory state

*/

import {
  MEMORY_SIZE,
  OPCODES
} from "../utils/constants.js";

import {
  formatBinaryWithPadding,
  getRawInput,
  preventNonBinaryDigits,
} from "../ui/inputDisplay.js";


import { decodeInstruction, decodeOperand } from "../utils/decode.js";

import { animateValChange } from "../ui/animate.js";

import { EXAMPLE_LIST } from "../utils/exampleList.js";

/*
  Use Model-View-Controller pattern to avoid race conditions and synchronise states across components.

  Model - Handles internal state
  View - Handles user view
  Controller - changes model values and updates view accordingly.
*/

class MemoryModel {
  /* Manages the internal memory state
  
  Internal State looks like this:

  instruction: "DAT" (asm)
  operand: "24" (decimal)
  label: "FAB" (ASCII label for a memory address)
  address: "5" (decimal)
  value: "0000000000011000"
  isActive: boolean (as a string)
  
  */

  #cells = [];

  constructor() {
    const initialBinary = "".padStart(MEMORY_SIZE, "0");
    for (let i = 0; i < MEMORY_SIZE; i++) {
      const memoryAddress = i;

      const cell = {
        // Initialise cells with zeroes
        // The index of the array container corresponds to the address
        instruction: "",
        operand: "",
        label: "",
        address: memoryAddress,
        value: initialBinary,
        isActive: "",
      };

      // inner state
      this.#cells.push(cell);
    }
  }

  setValue(address, value) {
    this.#cells[address].value = value;
    this.#updateInstruction(address);
    this.#updateOperand(address);
  }

  getValue(address) {
    return this.#cells[address].value;
  }

  setLabel(address, label) {
    if (!label) {
        this.#cells[address].label = "";
        return;
    }

    const formattedLabel = label.toUpperCase();

    // must be uppercase i.e. LOD
    const duplicate = this.#cells.find(
      (cell) => cell.label === formattedLabel && cell.address !== address
    );

    if (duplicate) {
      return;
    }

    this.#cells[address].label = label;
  }

  getLabelAddress(label) {
    // Search for matching label in the cell
    const cell = this.#cells.find((cell) => cell.label === label);
    return cell ? cell.address : null;
  }

  #updateInstruction(address) {
    const value = this.#cells[address].value;
    const instructionBin = value.slice(0, 4);
    const instruction = decodeInstruction(instructionBin);
    this.#cells[address].instruction = instruction;
  }

  #updateOperand(address) {
    const value = this.#cells[address].value;
    const operandBin = value.slice(4);
    this.#cells[address].operand = operandBin;
  }

  getInstruction(address) {
    return this.#cells[address].instruction;
  }

  getOperand(address) {
    return this.#cells[address].operand;
  }

  getLabel(address) {
    return this.#cells[address].label;
  }

  setActive(address, boolean) {
    this.#cells[address].isActive = boolean;
  }

  getActive(address) {
    if (!address) {
      // if we don't know the address of the active cell, loop through and find the right active cell.
      return this.#cells.findIndex((cell) => cell.isActive == true);
    }
    return this.#cells[address].isActive;
  }
}

class MemoryView {
  /*
  Manages the user view of our RAM cells
  */
  #cellsVal = []; // cell value
  #cellsAddr = []; // cell address
  #cellsAddrLabel = []; // cell address label
  #cellsInstruction = []; // instruction
  #cellsOperand = []; // operand in decimal
  #cellsActive = []; // active memory cell

  constructor() {
    for (let i = 0; i < MEMORY_SIZE; i++) {
      this.#cellsVal[i] = document.getElementById(`mem-val-${i}`);

      this.#cellsAddr[i] = document.getElementById(`mem-addr-${i}`);

      this.#cellsAddrLabel[i] = document.querySelector(
        `#mem-addr-label-${i} label`
      );

      this.#cellsActive[i] = document.getElementById(`mem-active-${i}`);

      this.#cellsInstruction[i] = document.getElementById(
        `mem-val-${i}-instruction`
      );

      this.#cellsOperand[i] = document.getElementById(`mem-val-${i}-operand`);
    }

    this.#setPlaceholders();
  }

  #setPlaceholders() {
    this.#cellsVal.forEach((cell) => {
      const defaultBinary = "".padStart(MEMORY_SIZE, "0");
      const formattedValue = formatBinaryWithPadding(defaultBinary);
      cell.placeholder = formattedValue;
    });
  }

  // already formats value
  setValue(address, value) {
    if (!value || value === "") {
        this.#cellsVal[address].value = ""; // show placeholder instead of DAT...
        return;
    }
    const formattedValue = formatBinaryWithPadding(value);
    this.#cellsVal[address].value = formattedValue;
  }

  getValue(address) {
    // returns raw binary for the model to do something with it.
    return getRawInput(this.#cellsVal[address].value);
  }

  setInstruction(address, instruction) {
    this.#cellsInstruction[address].textContent = instruction;
  }

  setOperand(address, operand) {
    this.#cellsOperand[address].textContent = operand;
  }

  setLabel(address, label) {
    // make sure it's UPPERCASE.
    if (label) label = label.toUpperCase();
    this.#cellsAddrLabel[address].textContent = label;
  }

  getLabel(address) {
    return this.#cellsAddrLabel[address].textContent;
  }

  setActive(address, symbol = "→") {
    // To remove, just set symbol to "" or null
    if (!symbol) {
      symbol = "";
    }
    this.#cellsActive[address].textContent = symbol;
  }

  getActive(symbol = "→") {
    return this.#cellsActive.find(this.#cellsActive === symbol);
  }
}

class MemoryController {
  /*
  Get input from the views, then ships it off to the model.
  */

  #model;
  #view;

  constructor() {
    this.#model = new MemoryModel();
    this.#view = new MemoryView();
    this.#setupEventListeners();
  }

  #setupEventListeners() {
    // Memory cell inputs
    for (let i = 0; i < MEMORY_SIZE; i++) {
      const memoryCell = document.getElementById(`mem-val-${i}`);

      memoryCell.addEventListener("input", (e) => {
        this.#handleInput(e);
      });

      memoryCell.addEventListener("blur", (e) => {
        this.#handleBlur(i, e);
      });
    }

    // Memory cell examples
    const exampleOptionSelector = document.getElementById("memory-examples");

    exampleOptionSelector.addEventListener("change", (e) => {
      const exampleNumber = e.target.value;
      this.handleLoadExample(exampleNumber);
    });
  }

  #handleInput(event) {
    /*
    everytime on input:
    - check and add extra space
    - update cursor position
    - show the correct ASM instruction + operand.

    We should probably 'finalize' the input by padding out
    the memory cell value on blur -- that's when
    the user is finished typing and clicks on anything else (including run)
    */

    // apply a series of transformations to make sure input is in the correct display format and readable.
    // don't allow non binary digits.
    let displayValue = event.target.value;
    displayValue = preventNonBinaryDigits(displayValue);
    // add spacing for readability
    displayValue = formatBinaryWithPadding(displayValue);
    event.target.value = displayValue;

    // interpret the ASM first and set it.
    // mem-val-0 → split it into
    // [mem, val, 0], where index 2 is the corresponds to the address, 0.

    // Display correct ASM + operand
    const address = parseInt(event.target.id.split("-")[2]);

    const rawInput = getRawInput(event.target.value);
    const instructionBin = rawInput.slice(0, 4);
    const instruction = decodeInstruction(instructionBin);
    const operandBin = rawInput.slice(4);
    const operand = decodeOperand(instruction, operandBin);
    // console.log(`instruction: ${instruction}`);
    // console.log(`operand: ${operand}`);

    const invalidInstruction = !OPCODES.get(instructionBin);

    if (invalidInstruction) {
      this.#view.setInstruction(address, instruction);
      return;
    }

    // const hasNoOperand = NO_OPERAND_INSTRUCTIONS.has(instruction);
    // const isAddressMode = ADDRESS_MODE_INSTRUCTIONS.has(instruction);

    // let operand;

    // pad the operand so that the display actually shows the correct
    // positional value of the operand i.e.
    // 0010 0000 0___ ____ → SUB 0 (because the missing digits imply zero)
    // and 0010 1000 ____ ____ → SUB 2048 (-2048)
    // this is more accurate to what's actually happening AND
    // it's more in line with the UX, where the cells are auto-padded on blur (does same thing here)
    const paddedOperand = operandBin.padEnd(MEMORY_SIZE - 4, "0");

    this.#view.setInstruction(address, instruction);
    this.#view.setOperand(address, operand);
  }

  // finalize input and send it over the MemoryModel
  #handleBlur(address, event) {
    // only pad out the input when the user leaves the input box
    const rawValue =
      getRawInput(event.target.value).padEnd(MEMORY_SIZE, "0") ||
      "".padEnd(MEMORY_SIZE, "0");
    // console.log(`rawValue on blur: ${rawValue}`);

    // const paddedValue = sanitizedValue.padStart(16, "0");

    this.#model.setValue(address, rawValue);

    this.#syncViewFromModel(address);

    // auto-fill cells if they're left blank on blur
    this.#view.setValue(address, rawValue);
  }

  // Update our view with the current model values.
  #syncViewFromModel(address) {
    /*
    Our current memory model is:
      instruction: "",
      operand: "",
      label: "",
      address: memoryAddress,
      value: initialBinary,
      isActive: "",
    */

    // address comes from when we set values.
    const value = this.#model.getValue(address);
    // TO-DO assembly window
    const label = this.#model.getLabel(address);
    const instruction = this.#model.getInstruction(address);
    const operandBin = this.#model.getOperand(address);
    // const noOperand = NO_OPERAND_INSTRUCTIONS.has(instruction);
    // console.log(`instruction: ${instruction}`);

    const isActive = this.#model.getActive(address);

    const operand = decodeOperand(instruction, operandBin);
    // console.log(`operand: ${operand}`);

    // View takes care of the "pretty-print"

    this.#view.setValue(address, value);
    // console.log(`syncViewFromModel instruction: ${instruction}`);
    this.#view.setInstruction(address, instruction);
    this.#view.setOperand(address, operand);

    // TO-DO assembly window
    this.#view.setLabel(address, label);
    // this.#view.setActive(address, isActive ? "→" : "");
  }

  /*
  Get value from view, sanitize, update model and finally sync view with our new model state
  */

  // Where does the address come from?
  // Comes from the memory cell where it was called.
  // Handle that in the eventListener → index of cell or ${i} in mem-val-${i}
  setValue(address) {
    const viewValue = this.#view.getValue(address);
    const rawValue = getRawInput(viewValue);

    this.#model.setValue(address, rawValue);
    this.#syncViewFromModel(address);
  }

  // TO-DO, for assembly window
  setLabel(address, label) {
    // get the address, label from the assembly window
    // probably return it as an array like this: [address, label] when parsing our textarea.
    const formattedLabel = label.toUpperCase();
    this.#model.setLabel(address, formattedLabel);
    this.#syncViewFromModel(address);
  }

  setActive(address) {
    this.#model.setActive(address, true);
    this.#view.setActive(address, "→");
  }

  removeActive(address) {
    this.#model.setActive(address, false);
    this.#view.setActive(address, "");
  }

  clearAllActive() {
    for (let i = 0; i < MEMORY_SIZE; i++) {
      this.#model.setActive(i, false);
      this.#view.setActive(i, "");
    }
    // reset to first cell.
    this.#model.setActive(0, true);
    this.#view.setActive(0, "→");
  }

  // CPU methods.
  read(address) {
    return this.#model.getValue(address);
  }

  async write(address, value) {
    this.#model.setValue(address, value);

    const cell = document.getElementById(`mem-val-${address}`);
    const formattedValue = formatBinaryWithPadding(value);
    await animateValChange(cell, formattedValue);

    this.#syncViewFromModel(address);
  }

  // Load examples.

  handleLoadExample(exampleNumber) {
    /*
    Loads examples from EXAMPLE_LIST, an array of named example memory objects
    EXAMPLE_{i} is the expected format usage of this parameter.
    */

    // clear cells
    this.clearMemoryView();

    EXAMPLE_LIST[exampleNumber].forEach((cell, address) => {
      const label = cell["mem-label"];
      const value = cell["mem-val"];

      if (!value || value.trim() === "") {
        return;
      }

      this.#model.setLabel(address, label);
      this.#model.setValue(address, value);
      this.#syncViewFromModel(address);
    });
  }

  // Utility

  clearMemoryView() {
    for (let i = 0; i < MEMORY_SIZE; i++) {
      const emptyValue = "".padEnd(MEMORY_SIZE, "0");
      this.#model.setValue(i, emptyValue);
      this.#model.setLabel(i, "");

      this.#view.setValue(i, "");
      this.#view.setInstruction(i, "");
      this.#view.setOperand(i, "");
      this.#view.setLabel(i, "");
    }
  }

  // Assembler stuff

  getLabel(address) {
    return this.#model.getLabel(address);
  }

  /**
   * loadProgram
   *
   * Loads a program that was assembled into memory (values + labels)
   *
   * @param {Array<Object>} programData
   * array containing { label, value } from assembleToBinary
   */

  loadProgram(programData) {
    this.clearMemoryView();

    programData.forEach((cell, address) => {
      if (address >= MEMORY_SIZE) return;

      // set only if there is a value (avoids cluttering view with "DAT")
      if (cell.value && cell.value.trim() !== "") {
        this.#model.setValue(address, cell.value);
      }

      // only sets labels
      if (cell.label && cell.label.trim() !== "") {
        this.#model.setLabel(address, cell.label);
      }

      const isCellEmpty =
        !this.#model.getValue(address) ||
        this.#model.getValue(address) === "".padEnd(MEMORY_SIZE, "0");

      if (!isCellEmpty || cell.label) {
        this.#syncViewFromModel(address);
      }
    });
  }
}

export { MemoryController };
