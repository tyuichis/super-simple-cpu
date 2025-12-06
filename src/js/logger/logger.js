/*
Writes executed instructions in the log window

in the format:

<Memory Address>: <Instruction> < <decimalOperand> (twosComplementOperand) > <acc>

i.e.

0: LOD  14  acc=18
1: SUB  15  acc=-6
2: JZR  10  acc=-6

<subject to change...>

 */

class Logger {
  #logWindow;

  constructor() {
    this.#logWindow = document.getElementById("log-window");
  }

  /**
   * Appends a formatted line to the log window
   *
   * @param {string} pc - program counter value (in decimal)
   * @param {string} instruction - as asm i.e. "LDI"
   * @param {string} operand - operand value (in decimal)
   * @param {string} acc - accumulator value (in decimal)
   */

  log(pc, instruction, operand, acc) {
    if (!this.#logWindow) return;

    // format: "00: LDI 5  |  ACC: 5"
    const paddedPC = String(pc).padStart(2, "0");

    const opString =
      operand !== undefined && operand !== "" ? ` ${operand}` : "";

    // add a nice \t indentation for spacing
    const entry = `${paddedPC}: ${instruction}${opString} \t| ACC: ${acc}\n`;

    this.#logWindow.value += entry;
  }

  clear() {
    if (this.#logWindow) {
      this.#logWindow.value = "";
    }
  }
}

export { Logger };
