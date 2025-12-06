/* Manages and controls the flow data in the CPU
 */

import {
  ADDRESS_MODE_INSTRUCTIONS,
  MEMORY_SIZE,
  OPCODES,
  STATUS_STATES,
} from "../utils/constants.js";

import { convertBinaryToDecimal } from "../utils/binary.js";

import { getRawInput } from "../ui/inputDisplay.js";

import { Logger } from "../logger/logger.js";
import { BusDiagram } from "../ui/busDiagram.js";

import { decodeInstruction, decodeOperand } from "../utils/decode.js";

class ControlUnit {
  #registers; // RegisterController
  #alu;
  #memory; // MemoryController
  #logger;
  #memoryVal = "0000000000000000";
  #memoryOperandBinary = "000000000000";
  #instructionBin = "";
  #currentInstruction = "";
  #currentPC = "";
  #halted = false;

  #cpuStatus = {
    currentStatus: document.getElementById("status-message"),
    currentInstruction: document.getElementById("current-instruction"),
  };

  #fetchExecuteCounter = document.getElementById("fetch-execute-counter");
  #busDiagram;

  /*
  When instantiating ControlUnit, pass through the components in order for ControlUnit
  to inherit the references.
  
  i.e.
  const registers = new RegisterController();
  const memory = new MemoryController();
  const input = new InputController();
  const output = new OutputController();

  const alu = new ALU(registers, memory, input, output);
  const controlUnit = new ControlUnit(registers, alu, memory);
  */

  constructor(registers, alu, memory) {
    this.#registers = registers;
    this.#alu = alu;
    this.#memory = memory;
    // Keep track of our executed things with our logger.
    this.#logger = new Logger();
    // Bus Diagram is created here, since bus diagram is altered only by ControlUnit
    this.#busDiagram = new BusDiagram();
  }

  async INITIALISE() {
    const currentPC = await this.#registers.getPCAddress();
    if (!currentPC || currentPC === "0000000000000000") {
      const zeroBinary = "0".padStart(MEMORY_SIZE, "0");
      await this.#registers.setPCValue(zeroBinary);
    }
  }

  async FETCH() {
    /* Fetch instruction @ address specified in PC, then store inside IR. */

    const currentPC = this.#registers.getPCAddress();
    this.#currentPC = currentPC;

    // Update active memory indicator
    this.#memory.setActive(this.#currentPC);

    // Read memory contents at PC
    const memoryBinary = this.#memory.read(this.#currentPC);
    this.#memoryVal = memoryBinary;

    // TO-DO? Maybe should say what exactly it's fetching.
    this.updateStatus("fetching", "Instruction from RAM");

    // this.#setFlow('fetch')

    // fetch the instruction w/ address currentPC, cpu → ram
    await this.#busDiagram.setFlow("flow-cpu-ram", `ADDR ${currentPC}`);

    const [assemblyInstruction, assemblyOperand] =
      this.#decodeAssembly(memoryBinary);

    // console.log(`memoryBinary is: ${memoryBinary}`);
    // console.log(`assemblyOperand is: ${assemblyOperand}`);

    const label = `${assemblyInstruction} ${assemblyOperand}`;

    // received instruction is read, cpu ← ram
    await this.#busDiagram.setFlow("flow-ram-cpu", label);

    // store a copy of the instruction and play animations
    const registerLabel = `ir = ${label}`;
    this.#busDiagram.setRegisterLabel(registerLabel);
    await this.#registers.setIRValue(this.#memoryVal);
  }

  // should probably handle if we can even execute it.
  async DECODE() {
    /* Decode instruction AND get extra information (if needed; handled by ALU)
    Most of these OPcodes require an operand, but ALU can safely ignore it */

    this.updateStatus("decoding");
    // Get instruction part of memory value
    // 0001000000000000 → 0001
    this.#instructionBin = this.#memoryVal.slice(0, 4);
    this.#currentInstruction = OPCODES.get(this.#instructionBin);
    this.#memoryOperandBinary = this.#memoryVal.slice(4);

    const memoryValue = this.#memoryVal;
    const [assemblyInstruction, assemblyOperand] =
      this.#decodeAssembly(memoryValue);

    const decode = {
      statusCode: null,
      opcode: assemblyInstruction,
      operand: assemblyOperand,
    };

    // If invalid OPCODE, update status on the Control Panel
    if (!this.#currentInstruction || this.#currentInstruction === "DAT") {
      this.updateStatus("error", "Invalid Instruction");
      decode.statusCode = "ILLEGAL_INSTRUCTION";
      return decode;
    }

    // handle out of bounds address memory accesses
    if (
      ADDRESS_MODE_INSTRUCTIONS.has(this.#currentInstruction) &&
      this.isOutOfBounds(assemblyOperand)
    ) {
      decode.statusCode = "SEGFAULT";
      return decode;
    }

    // Increment PC only if we have a valid instruction
    const currentPC = this.#registers.getPCAddress();
    const nextPC = (currentPC + 1).toString(2).padStart(16, "0");
    await this.#registers.setPCValue(nextPC);

    decode.statusCode = "OK";
    return decode;
  }

  async EXECUTE() {
    this.updateStatus("executing");
    // Use the ALU to execute the instruction
    // Pass the memoryOperandBinary; INP and OUT ignore it

    // Syntax: alu["method"](operand argument in binary)
    const currentInstruction = this.#currentInstruction;
    const memoryOperandBinary = this.#memoryOperandBinary;

    // May refactor since assembly instruction is already current instruction...
    const memoryValue = this.#memoryVal;
    const [assemblyInstruction, assemblyOperand] =
      this.#decodeAssembly(memoryValue);

    // Handle different flow sequences depending on the type of operation
    const readInstructionSet = new Set(["LOD", "ADD", "SUB"]);
    const writeInstrutionSet = new Set(["STO"]);
    const controlInstructionSet = new Set(["JMP", "JNG", "JZR"]);

    // read operations
    if (readInstructionSet.has(currentInstruction)) {
      // CPU → RAM (send address to RAM)
      await this.#busDiagram.setFlow("flow-cpu-ram", `ADDR ${assemblyOperand}`);

      // CPU ← RAM (retrieve information from RAM address)
      const dataAtAddress = this.#memory.read(assemblyOperand);
      const [dataInstruction, dataOperand] = this.#decodeAssembly(
        dataAtAddress
      ) || ["DAT", convertBinaryToDecimal(dataAtAddress)];

      const label = `${dataInstruction} ${dataOperand}`;

      await this.#busDiagram.setFlow("flow-ram-cpu", label);
    }

    // write operations
    else if (writeInstrutionSet.has(currentInstruction)) {
      // write doesn't change acc value, so we can safely display the current acc val
      const accValue = this.#registers.getACCValue();
      const accDecimal = convertBinaryToDecimal(accValue);
      await this.#busDiagram.setFlow(
        "flow-cpu-ram",
        `ADDR ${assemblyOperand}, DAT ${accDecimal}`
      );

      this.#busDiagram.setRamLabel(
        `Address ${assemblyOperand} : DAT ${accDecimal}`
      );
    }

    // output
    else if (currentInstruction === "OUT") {
      // output doesn't change acc value, so we can safely display the current acc val
      const accValue = this.#registers.getACCValue();
      const accDecimal = convertBinaryToDecimal(accValue);
      await this.#busDiagram.setFlow("flow-cpu-output", `DAT ${accDecimal}`);
    }

    // jump
    else if (controlInstructionSet.has(currentInstruction)) {
      const currentAcc = Number(
        convertBinaryToDecimal(this.#registers.getACCValue())
      );
      if (this.#canJump(currentInstruction, currentAcc)) {
        await this.#busDiagram.setFlow(
          "flow-cpu-ram",
          `ADDR ${assemblyOperand}`
        );
        this.#busDiagram.setRamLabel(`Jumped to address ${assemblyOperand}`);
      } else {
        await this.#busDiagram.setRegisterLabel(`Cannot Jump!`);
      }
    }

    const accInstructions = ["LOD", "ADD", "SUB", "LDI"];

    // modular control flow in case I need to handle bus flows differently for some instructions...
    if (currentInstruction === "INP") {
      // (binary) => this.#onInput(binary) is required to retain 'this' (object) context
      // forgot about this advanced javascript -- this is needed so the reference
      // to the bus diagram is retained (so the callback actually works)
      await this.#alu[currentInstruction](memoryOperandBinary, (binary) =>
        this.#onInput(binary)
      );
    } else if (accInstructions.includes(currentInstruction)) {
      await this.#alu[currentInstruction](
        memoryOperandBinary,
        (binary, flags) => this.#onAccUpdate(binary, flags)
      );
    } else {
      await this.#alu[currentInstruction](memoryOperandBinary);
    }

    // get the new valjue of the accumulator before storing it in the logger
    const accValue = this.#registers.getACCValue();
    const accDecimal = convertBinaryToDecimal(accValue);
    const pc = String(Number(this.#registers.getPCAddress()) - 1);
    this.#logger.log(pc, assemblyInstruction, assemblyOperand, accDecimal);

    // const updatedAccValue = this.#registers.getACCValue();
    // const updatedAccDecimal = convertBinaryToDecimal(updatedAccValue);

    // const accInstructions = ["LOD", "ADD", "SUB", "LDI"];

    // if (accInstructions.includes(currentInstruction)) {
    //   await this.#busDiagram.setRegisterLabel(`acc = ${updatedAccDecimal}`);
    // }

    // little timeout to let the acc breathe
    // await new Promise((resolve) => setTimeout(resolve, 600));

    // manually refresh to prevent animationend lock
    // this.#busDiagram.clearFlow();

    // Update fetch-execute counter at end of execute cycle
    const fetchExecuteCount = this.getFetchExecuteCounter();
    const updatedFetchExecuteCount = fetchExecuteCount + 1;
    this.setFetchExecuteCounter(updatedFetchExecuteCount);

    // broken due to _ conditions , but... probably not necessary
    // await this.#busDiagram.setRegisterLabel(`pc = ${updatedFetchExecuteCount}`);

    if (currentInstruction === "STP") {
      this.updateStatus("stopped");
      this.#halted = true;
      return;
    }
  }

  // Utility functions
  getInstruction() {
    return this.#currentInstruction;
  }

  isHalted() {
    return this.#halted;
  }

  isOutOfBounds(address) {
    if (address < 0 || address > MEMORY_SIZE - 1) return true;
    return false;
  }

  // TO-DO, also reset active memory cell to beginning?
  reset() {
    this.#halted = false;
  }

  // needed to check if we should fire the cpu → ram flow
  #canJump(jumpInstruction, accumulator) {
    if (jumpInstruction === "JNG") {
      return accumulator < 0;
    } else if (jumpInstruction === "JZR") {
      return accumulator === 0;
    } else {
      // default because JMP has no conditions.
      return true;
    }
  }

  // bus flow: callback function to execute within INP
  async #onInput(binary) {
    const decimal = convertBinaryToDecimal(binary);
    await this.#busDiagram.setFlow("flow-input-cpu", `DAT ${decimal}`);
  }

  // bus flow: callback to run for instructions that need to update the acc
  // async #onAccUpdate(binary) {
  //   const decimal = convertBinaryToDecimal(binary);
  //   await this.#busDiagram.setRegisterLabel(`acc = ${decimal}`);
  // }

  async #onAccUpdate(binary, flags = {}) {
    const decimal = convertBinaryToDecimal(binary);

    let labelText = `acc = ${decimal}`;

    if (flags.overflow) {
      labelText += " : overflow!";
    }

    if (flags.underflow) {
      labelText += " : underflow!";
    }

    await this.#busDiagram.setRegisterLabel(labelText);
  }

  updateStatus(statusCode, customMessage = null) {
    /* Updates the status header with a message.
      
      Usage: 
      updateStatus('error', "Out of bounds!");
      i.e. Error : "Out of bounds!"

      Allows for more flexible status messages...
    */

    // go update the constants file if we want to add more STATUS_STATES
    // sets the appropriate CSS Class for the status (for better UX)
    this.#cpuStatus.currentStatus.classList = "";
    const status = STATUS_STATES[statusCode];

    this.#cpuStatus.currentStatus.classList = status.className;

    if (!customMessage) {
      this.#cpuStatus.currentStatus.textContent = status.message;
    } else {
      this.#cpuStatus.currentStatus.textContent = `${status.message} : ${customMessage}`;
    }
  }

  /**
   * decodeAssembly
   *
   * Decodes the raw binary into its assembly counterpart
   *
   * @param {string} binary
   * This is the raw binary value to be decoded, usually received
   * by reading the memory contents at a specified address.
   *
   * @returns {String[instruction, base10]}
   * This will return a tuple containing a stringified representation of
   * the Instruction and Operand (the operand is to be interpreted depending
   * on the instruction - some are to be interpreted as an address OR
   * raw data OR no data at all, i.e. `STP`)
   *
   * The `base10` value depends on the instruction;
   * if the instruction is a memory address, then we only care about unsigned
   * if the instruction uses a raw value, then we need both unsigned/signed (two's complement)
   * if the instruction doesn't need any values (i.e. STP), then return an empty string.
   * If no instruction is provided; then, there aren't enough bits.
   *
   *
   * @example
   *
   * decodeAssembly(0011100000000000); // → ["LOD", "2048"] (address mode)
   * decodeAssembly(0010100000000000) // → ["SUB", "2048 (-2048)"]
   * decodeAssembly(0010000000000001) // → ["SUB", "1"]
   *
   */

  #decodeAssembly(binary) {
    // transform our binary data...
    const rawInput = getRawInput(binary);
    // console.log(`decodeAssembly rawInput is: ${rawInput}`);

    const instructionBinary = rawInput.slice(0, 4);
    const operandBinary = rawInput.slice(4);
    // console.log(`decodeAssembly operandBinary is: ${operandBinary}`);

    const instruction = decodeInstruction(instructionBinary);
    const operand = decodeOperand(instruction, operandBinary);
    // console.log(`decodeAssembly operand is: ${operand}`);

    return [instruction, operand];
  }

  getFetchExecuteCounter() {
    // Number so we can increment it before setting it
    return Number(this.#fetchExecuteCounter.textContent);
  }

  setFetchExecuteCounter(value) {
    this.#fetchExecuteCounter.textContent = value;
  }
}

export { ControlUnit };
