/** OPcodes
 * for binary → mnemonic
 */
const OPCODES = new Map([
  ["1111", "STP"],
  ["0001", "ADD"],
  ["0010", "SUB"],
  ["0011", "LOD"],
  ["0100", "LDI"],
  ["0101", "STO"],
  ["0110", "INP"],
  ["0111", "OUT"],
  ["1000", "JMP"],
  ["1001", "JNG"],
  ["1010", "JZR"],
  ["0000", "DAT"], // special specifier (technically not part of OPcodes)
]);

// Reverse map for OPcodes, mnemonic → binary
// Use for assembly window
const MNEMONICS = new Map(
  [...OPCODES.entries()].map(([bin, asm]) => [asm, bin])
);

// In case I ever want to change the instruction size to be greater than 4 bits.
const INSTRUCTION_SIZE = 4;

/** Instruction Sets
 *
 * I only need to check for an instruction's membership within a group.
 * This should give me O(1) lookup time instead of O(n) lookup.
 *
 */

const NO_OPERAND_INSTRUCTIONS = new Set(["STP", "INP", "OUT"]);
const ADDRESS_MODE_INSTRUCTIONS = new Set([
  "JMP",
  "JNG",
  "JZR",
  "LOD",
  "STO",
  "ADD",
]);

// This is for bus-diagram
const INSTRUCTION_FLOWS = {
  "flow-ram-cpu": new Set(["ADD", "SUB", "LOD", "JMP", "JNG", "JZR"]),
  "flow-cpu-ram": new Set(["STO"]),
  "flow-input-cpu": new Set(["INP"]),
  "flow-cpu-output": new Set(["OUT"]),
  "flow-none": new Set(["LDI", "STP"]),
};

// In case we add more slots; modify once here and off it goes.
const MEMORY_SIZE = 16;

const STATUS_STATES = {
  ready: {
    className: "ready",
    message: "Ready to start!",
  },
  running: {
    className: "running",
    message: "Running!",
  },
  fetching: {
    className: "fetching",
    message: "Fetching",
  },
  decoding: {
    className: "decoding",
    message: "Decoding instruction",
  },
  executing: {
    className: "executing",
    message: "Executing instruction",
  },
  paused: {
    className: "paused",
    message: "Paused",
  },
  stopped: {
    className: "stopped",
    message: "Stopped",
  },
  halted: {
    className: "halted",
    message: "Stopped. Press reset to continue from the beginning.",
  },
  error: {
    className: "error",
    message: "Error",
  },
  segfault: {
    className: "segfault",
    message: "Address out of bounds!",
  },
};

export {
  OPCODES,
  MNEMONICS,
  INSTRUCTION_SIZE,
  NO_OPERAND_INSTRUCTIONS,
  ADDRESS_MODE_INSTRUCTIONS,
  INSTRUCTION_FLOWS,
  MEMORY_SIZE,
  STATUS_STATES,
};
