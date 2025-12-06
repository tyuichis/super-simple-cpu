// Store example memory an array

// Address (use index as address counter) → Object containing Label, Binary Data

/*
    [{
        "mem-label": "TOAST",
        "mem-val": "0001 1000 1000 1000"
    },
    ...
    ]
*/

// Template:
/*
    {
        "mem-label": "",
        "mem-val": ""
    }
*/

// Blank memory cells, "", are treated as 0000 0000 0000 0000

import { MEMORY_SIZE } from "./constants.js";

// TO-DO, store examples as separate JSON files

// Example 0 - null; blank state

const EXAMPLE_0 = [
  {
    "mem-label": "",
    "mem-val": "0000000000000000",
  },
];

// Example 1 - Sequence
const EXAMPLE_1 = [
  {
    "mem-label": "",
    "mem-val": "0100000000000101",
  },
  {
    "mem-label": "",
    "mem-val": "0001000000000100",
  },
  {
    "mem-label": "",
    "mem-val": "0101000000000101",
  },
  {
    "mem-label": "",
    "mem-val": "1111000000000000",
  },
  {
    "mem-label": "",
    "mem-val": "0000000000101000",
  },
];

// Example 2 - Input and Output
const EXAMPLE_2 = [
  {
    "mem-label": "",
    "mem-val": "0110000000000000",
  },
  {
    "mem-label": "",
    "mem-val": "0111000000000000",
  },
  {
    "mem-label": "",
    "mem-val": "1111000000000000",
  },
];

// Example 3 - Negative Numbers

const EXAMPLE_3 = [
  {
    "mem-label": "",
    "mem-val": "0100000000000100",
  },
  {
    "mem-label": "",
    "mem-val": "0010000000000101",
  },
  {
    "mem-label": "",
    "mem-val": "1111000000000000",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "0000000000000110",
  },
];

// Example 4 - Copy a Number
const EXAMPLE_4 = [
  {
    "mem-label": "",
    "mem-val": "0100000000001101",
  },
  {
    "mem-label": "",
    "mem-val": "0011000000001101",
  },
  {
    "mem-label": "",
    "mem-val": "0101000000001100",
  },
  {
    "mem-label": "",
    "mem-val": "1111000000000000",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "0000000000000110",
  },
];

// Example 5 - Counting Loop
const EXAMPLE_5 = [
  {
    "mem-label": "",
    "mem-val": "0100000000000110",
  },
  {
    "mem-label": "",
    "mem-val": "1001000000000100",
  },
  {
    "mem-label": "",
    "mem-val": "0010000000000101",
  },
  {
    "mem-label": "",
    "mem-val": "1000000000000001",
  },
  {
    "mem-label": "",
    "mem-val": "1111000000000000",
  },
  {
    "mem-label": "",
    "mem-val": "0000000000000001",
  },
];

// Example 6 - GCD
const EXAMPLE_6 = [
  {
    "mem-label": "",
    "mem-val": "0011000000001110",
  },
  {
    "mem-label": "",
    "mem-val": "0010000000001111",
  },
  {
    "mem-label": "",
    "mem-val": "1010000000001010",
  },
  {
    "mem-label": "",
    "mem-val": "1001000000000110",
  },
  {
    "mem-label": "",
    "mem-val": "0101000000001110",
  },
  {
    "mem-label": "",
    "mem-val": "1000000000000000",
  },
  {
    "mem-label": "",
    "mem-val": "0011000000001111",
  },
  {
    "mem-label": "",
    "mem-val": "0010000000001110",
  },
  {
    "mem-label": "",
    "mem-val": "0101000000001111",
  },
  {
    "mem-label": "",
    "mem-val": "1000000000000000",
  },
  {
    "mem-label": "",
    "mem-val": "1111000000000000",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "",
  },
  {
    "mem-label": "",
    "mem-val": "0000000000010010",
  },
  {
    "mem-label": "",
    "mem-val": "0000000000011000",
  },
];

const EXAMPLE_LIST = [
  EXAMPLE_0,
  EXAMPLE_1,
  EXAMPLE_2,
  EXAMPLE_3,
  EXAMPLE_4,
  EXAMPLE_5,
  EXAMPLE_6,
];

EXAMPLE_LIST.forEach((example) => {
  example.forEach((cell) => {
    // Only pad out the cells containing a value;
    // other cells that are blank stay blank.
    if (cell["mem-val"]) {
      cell["mem-val"] = cell["mem-val"].padEnd(MEMORY_SIZE, "0");
    }
  });
});

export { EXAMPLE_LIST };
