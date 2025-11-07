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
  ["0000", "DAT"], // special specifier (technically not part of OPcode)
]);

// In case we add more slots; modify once here and off it goes.
const MEMORY_SIZE = 16;

export { OPCODES, MEMORY_SIZE };
