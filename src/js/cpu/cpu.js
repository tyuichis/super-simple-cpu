/* Manages CPU state
 */

import { RegisterController } from "./registers.js";
import { MemoryController } from "../memory/memory.js";
import { ControlUnit } from "./controlUnit.js";
import { ALU } from "./alu.js";
import { InputController } from "../io/input.js";
import { OutputController } from "../io/output.js";
import { Assembler } from "../assembler/assembler.js";

class CPU {
  #registers;
  #controlUnit;
  #alu;
  #memory;
  #input;
  #output;
  #assembler;
  #isRunning = false;
  #isStopped = false;

  constructor() {
    this.#registers = new RegisterController();
    this.#memory = new MemoryController();
    this.#input = new InputController();
    this.#output = new OutputController();

    this.#alu = new ALU(
      this.#registers,
      this.#memory,
      this.#input,
      this.#output
    );

    this.#controlUnit = new ControlUnit(
      this.#registers,
      this.#alu,
      this.#memory
    );

    this.#assembler = new Assembler();
  }

  test() {
    this.#assembler.getAssemblyText();
  }

  async start() {
    await this.#controlUnit.INITIALISE();
  }

  async step() {
    /*
      Execute a single instruction at a time.
    */

    if (this.#isRunning) {
      return;
    } else {
      this.#isRunning = true;
    }

    if (this.#controlUnit.isHalted()) {
      this.#controlUnit.updateStatus("halted");
      return;
    }

    // Update status header
    this.#controlUnit.updateStatus("executing");
    // this.#controlUnit.updateInstructionStatus();

    // get PC before fetch (for cleanup)
    const pcBeforeFetch = this.#registers.getPCAddress();

    await this.#controlUnit.FETCH();

    const decode = await this.#controlUnit.DECODE();

    // if we're not able to decode, clean up and do nothing
    if (decode.statusCode === "ILLEGAL_INSTRUCTION") {
      await this.cleanUp(pcBeforeFetch);
      return;
    }

    if (decode.statusCode === "SEGFAULT") {
      this.#controlUnit.updateStatus("segfault", `@ address ${decode.operand}`);
      await this.cleanUp(pcBeforeFetch);
      return;
    }

    await this.#controlUnit.EXECUTE();

    await this.cleanUp(pcBeforeFetch);

    if (!this.#controlUnit.isHalted()) {
      this.#controlUnit.updateStatus("paused");
    }

    // step finishes, so exit out.
    this.#isRunning = false;
  }

  async autoRun() {
    /*
      Execute all instructions.
      Run speed controlled by CSS; we listen for animationEnd and CSS classes alter the animation speed.
    */

    // manually keep track of 'user stopped the machine'
    this.#isStopped = false;

    // IT's an event-controlled loop
    this.#isRunning = true;

    // this.#controlUnit.updateStatus("executing");

    while (this.#isRunning) {
      if (this.#controlUnit.isHalted()) {
        this.#controlUnit.updateStatus("halted");
        return;
      }

      // Update status header
      this.#controlUnit.updateStatus("running");
      // this.#controlUnit.updateInstructionStatus();

      // get PC before fetch (for cleanup)
      const pcBeforeFetch = this.#registers.getPCAddress();

      await this.#controlUnit.FETCH();

      const decode = await this.#controlUnit.DECODE();

      // if we're not able to decode, clean up and do nothing
      if (decode.statusCode === "ILLEGAL_INSTRUCTION") {
        await this.cleanUp(pcBeforeFetch);
        return;
      }

      if (decode.statusCode === "SEGFAULT") {
        this.#controlUnit.updateStatus(
          "segfault",
          `@ address ${decode.operand}`
        );
        await this.cleanUp(pcBeforeFetch);
        return;
      }

      await this.#controlUnit.EXECUTE();

      await this.cleanUp(pcBeforeFetch);

      if (this.#isStopped) {
        this.#controlUnit.updateStatus("stopped");
      } else if (!this.#controlUnit.isHalted()) {
        this.#controlUnit.updateStatus("paused");
      }

      await this.cleanUp(pcBeforeFetch);
    }
  }

  // stop (also stops infinite loops)
  stop() {
    this.#isRunning = false;
    this.#isStopped = true;
  }

  /**
   * cleanUp
   *
   * This function removes the reference to the memory address
   * specified, typically the last program counter value.
   *
   *
   * @param {string} lastPC
   * @returns Promise<void>
   */

  async cleanUp(lastPC) {
    return new Promise((resolve) => {
      if (this.#controlUnit.getInstruction() === "STP") {
        // don't advance to next pc
        // stop on active memory cell...
        resolve();
        return;
      }

      // clean up old active indicator
      this.#memory.removeActive(lastPC);

      // set new active indicator
      const currentPC = this.#registers.getPCAddress();
      this.#memory.setActive(currentPC);

      resolve();
    });
  }

  resetActiveMemory() {
    this.#memory.clearAllActive();
    this.#memory.setActive(0);
  }

  resetStatus() {
    // reset pc to 0
    this.#registers.setPCValue(0);

    // reset active memory to index 0
    this.#memory.clearAllActive();

    // reset halted status
    this.#controlUnit.reset();
    this.#controlUnit.updateStatus("ready");
  }

  clearFetchExecuteCounter() {
    this.#controlUnit.setFetchExecuteCounter(0);
  }

  assemble() {
    const programData = this.#assembler.assembleToBinary();

    this.#memory.loadProgram(programData);

    this.resetStatus();
  }
}

export { CPU };
