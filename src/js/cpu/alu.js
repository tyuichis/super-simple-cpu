/* Handles instruction execution
 */

import { addBits, subBits, convertBinaryToDecimal } from "../utils/binary.js";
import { MEMORY_SIZE } from "../utils/constants.js";

class ALU {
  #registers; // RegisterController
  #memory; // MemoryController
  #input; // InputController
  #output; // OutputController

  constructor(registers, memory, input, output) {
    this.#registers = registers;
    this.#memory = memory;
    this.#input = input;
    this.#output = output;
  }

  /**
   * Some instructions accept a callback function
   * so that the bus flow or label update can trigger with the right information
   * BEFORE another thing is updated (this is usually the register)
   *
   */

  // ADD should fetch CPU → RAM, then CPU ← RAM
  // 0001 ADD
  async ADD(operand, onAccChange) {
    const decimalAddress = parseInt(operand, 2);
    const valueAtAddress = this.#memory.read(decimalAddress);
    const currentAccVal = await this.#registers.getACCValue();

    const {result, carry} = addBits(currentAccVal, valueAtAddress);

    // if there is an overflow, handle it in the caller
    if (onAccChange) {
      await onAccChange(result, {overflow: carry});
    }

    await this.#registers.setACCValue(result);
  }

  // 0010 SUB
  async SUB(operand, onAccChange) {
    const decimalAddress = parseInt(operand, 2);
    const valueAtAddress = this.#memory.read(decimalAddress);
    const currentAccVal = await this.#registers.getACCValue();

    const {result, underflow} = subBits(currentAccVal, valueAtAddress);

    // if there is an underflow, handle it in the caller
    if (onAccChange) {
      await onAccChange(result, underflow);
    }

    await this.#registers.setACCValue(result);
  }

  // 0011 LOD
  async LOD(address, onAccChange) {
    const decimalAddress = parseInt(address, 2);
    const memoryVal = this.#memory.read(decimalAddress);

    if (onAccChange) {
      await onAccChange(memoryVal);
    }

    await this.#registers.setACCValue(memoryVal);
  }

  // 0100 LDI
  async LDI(operand, onAccChange) {
    const formattedValue = operand.padStart(MEMORY_SIZE, "0");

    if (onAccChange) {
      await onAccChange(formattedValue);
    }

    await this.#registers.setACCValue(formattedValue);
  }

  // 0101 STO
  async STO(binaryAddress) {
    const currentACC = await this.#registers.getACCValue();
    const decimalAddress = parseInt(binaryAddress, 2);

    await this.#memory.write(decimalAddress, currentACC);
  }

  // 0110 INP
  // ignore first parameter, run a callback function to make sure
  // I can trigger the bus flow before I update the registers...
  async INP(nothing, onInput) {
    // wait for the user to input something
    const input = await this.#input.read();

    if (onInput) {
      // run the bus loop animation (triggered within controlUnit)
      await onInput(input);
    }

    await this.#registers.setACCValue(input);
  }

  // 0111 OUT
  async OUT() {
    const currentACC = await this.#registers.getACCValue();
    await this.#output.write(currentACC);
  }

  /*
    'JMP' type opcodes

    NOTE: will be a bug if jumping out of bounds of [0, 15]
    Either let it happen (but pause execution and abort execution)
    OR prevent it from happening by snipping off the rest of operand that is > 1111
    i.e.   binary:     1000 0000 | 1101 
           index:      0123 4567   8...
    Snip off the last 4 bits as our memory address

  */

  // 1000 JMP
  async JMP(address) {
    const decimalAddress = parseInt(address, 2);
    const binaryPC = decimalAddress.toString(2).padStart(16, "0");
    await this.#registers.setPCValue(binaryPC);
  }

  // 1001 JNG
  async JNG(address) {
    const currentAcc = await this.#registers.getACCValue();
    const signed = parseInt(convertBinaryToDecimal(currentAcc), 10);

    if (signed < 0) {
      const decimalAddress = parseInt(address, 2);
      const binaryPC = decimalAddress.toString(2).padStart(16, "0");
      await this.#registers.setPCValue(binaryPC);
    }
  }

  // 1010 JZR
  async JZR(address) {
    const currentAcc = await this.#registers.getACCValue();

    if (parseInt(currentAcc, 2) === 0) {
      const decimalAddress = parseInt(address, 2);
      const binaryPC = decimalAddress.toString(2).padStart(16, "0");
      await this.#registers.setPCValue(binaryPC);
    }
  }

  // 1111 STP
  STP() {
    return "STP";
  }
}

export { ALU };
