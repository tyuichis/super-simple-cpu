/*
assembler.mjs/js

Converts assembly instructions written in the text area to raw binary
and places it the memory cells.

*/

import { convertDecimalToBinary } from "../utils/binary.js";
import { MEMORY_SIZE } from "../utils/constants.js";

import { encodeInstruction, encodeOperand } from "../utils/encode.js";

class Assembler {
  #assemblyWindow;

  constructor() {
    this.#assemblyWindow = document.getElementById("assembly-window");
  }

  /**
   * getAssemblyText
   *
   * @returns {array}
   *
   * array containing all the raw assembly line by line.
   *
   */

  #getAssemblyText() {
    const assemblyText = this.#assemblyWindow.value;

    const assembly = assemblyText.split("\n").map((line) => {
      const raw = line.split(";")[0].trim();

      const parts = raw.split(" ").filter((x) => x !== ""); // exclude any extra white spaces

      // should be [<LABEL>, <INSTRUCTION>, <OPERAND>]
      // label is optional/null.

      // i.e. <INSTRUCTION>, <OPERAND>, prepend with an empty label.
      if (parts.length === 2) {
        parts.unshift("");
      } else {
        while (parts.length < 3) {
            // THIS might cause issues with state mutations
            // if the webpage crashes on assembly load... this is flagged
          // prepend with empty spaces; i.e. DATA slots like
          /*
        LDI 5
        STO THREE
        THREE
         */
          parts.push("");
        }
      }

      return parts;
    });

    return assembly;
  }

  /**
   * parseAssembly
   *
   * Scans the assembly line by line
   * and ignores comments
   *
   * @param {array} assemblyList
   *
   * array contanining the assembly text line by line
   * which is usually the output of getAssemblyText
   *
   * @returns {array<object>}
   *
   * returns an array of objects that contain the assembly line
   *
   * i.e.
   *
   * [
   *
   *  {
   *      label,
   *      instruction,
   *      operand
   *  }
   *
   * ]
   *
   */

  #parseAssembly(assemblyList) {
    const assembly = assemblyList.map((assembly) => {
      return {
        label: assembly[0],
        instruction: assembly[1],
        operand: assembly[2],
      };
    });

    // while (assembly.length < MEMORY_SIZE) {
    //   const emptyCell = {
    //     label: "",
    //     instruction: "",
    //     operand: "",
    //   };
    //   // pad out the extra memory slots
    //   assembly.push(emptyCell);
    // }

    for (let i = assembly.length; i < MEMORY_SIZE; i++) {
      assembly.push({ label: "", instruction: "", operand: "" });
    }

    return assembly;
  }

  /**
   * assembleToBinary()
   *
   *
   * Converts all assembly to its binary representation
   *
   * also handles label → binary address covnersion
   *
   * @returns {Array<object>}
   *
   * returns memory-like object that contains
   * a label and value.
   *
   * i.e. [
   * {
   *  label,
   *  value
   * }
   * ]
   *
   *
   *
   * Memory should take care of the setting/interpretation.
   */

  assembleToBinary() {
    const assemblyText = this.#getAssemblyText();

    const assemblyMemory = this.#parseAssembly(assemblyText);

    // build label map
    const labelMap = new Map();

    assemblyMemory.forEach((cell, index) => {
      if (index >= MEMORY_SIZE) return;

      if (cell.label && cell.label.trim() !== "") {
        // label "ONE" → ADDR 1
        // that was an exam question...
        labelMap.set(cell.label, index);
      }
    });

    // build the binary-assembly list
    const binaryAssembly = assemblyMemory.map((cell, index) => {
      if (!cell.instruction) {
        return {
          label: cell.label,
          value: "",
        };
      }

      if (cell.instruction === "DAT") {
          // DAT should be the full 16 bits (just like in memory...)
          const rawValue = convertDecimalToBinary(cell.operand);
          return {
              label: cell.label,
              value: rawValue
          };
      }

      // if we can't find the correct instruction, just throw an invalid opcode
      const instructionBin = encodeInstruction(cell.instruction) || "1101";
      //   const operandBin =
      //     encodeOperand(cell.operand) || "".padStart(MEMORY_SIZE - 4, "0");
      let operandBin;

      if (labelMap.has(cell.operand)) {
        const address = labelMap.get(cell.operand);
        operandBin = convertDecimalToBinary(address).slice(4);
      } else {
        operandBin =
          encodeOperand(cell.operand) || "".padStart(MEMORY_SIZE - 4, "0");
      }

      const value = instructionBin + operandBin;

      const assemblyBinary = {
        label: cell.label,
        value: value,
      };
      return assemblyBinary;
    });

    return binaryAssembly;
  }
}

export { Assembler };
