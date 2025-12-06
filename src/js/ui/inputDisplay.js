/* Helper functions that get, sanitize and modify the input behavior
 */

import {
  convertBinaryToDecimal,
} from "../utils/binary.js";

// Intended usage:
// getRawInput → preventNonBinaryDigits → addBinaryPadding (from binary.js)

function getRawInput(inputString) {
  return inputString.replaceAll(" ", "");
}

function preventNonBinaryDigits(rawInput) {
  /* Returns only the bits as a string
   */

  // only include 0 or 1
  let binaryDigits = "";

  for (let i = 0; i < rawInput.length; i++) {
    if (rawInput[i] === "0" || rawInput[i] === "1") {
      binaryDigits += rawInput[i];
    }
  }

  return binaryDigits;
}

function padBinaryToFormat(inputString, size) {
  /* Runs when the user presses start or run but has incomplete digits
  i.e. 0011 0000 0000 01
                        ^^
                        Missing 2 bits
    format to → 0011 0000 0000 0100

    and 0011 001 → 0011 0010 0000 0000
  */

  // sanitize value first so we can build our string from scratch.
  let paddedBinary = getRawInput(inputString);
  paddedBinary = paddedBinary.padEnd(size, "0");
  return formatBinaryWithPadding(paddedBinary);
}


// need to refactor to just accept instruction, binary
function displayASMValue(rawBinaryValue, requireOperand = true, addressMode = false) {
  /*
  Show unsigned and two's complement version.

  ALSO, control whether the operand is shown i.e., if the OPcode doesn't require it.

  I don't want to refactor classes, so I'll just declare keyword arguments to simplify my life;
  
  if we have 'addressMode', then, return just the unsigned value (no negative number-- doesn't matter)
  if we have requireOperand, show the operand. else set it to false manually (i.e. for JMP.)
  */

  if (!requireOperand) {
    return "";
  }

  const unsigned = parseInt(rawBinaryValue, 2);
  const signed = parseInt(convertBinaryToDecimal(rawBinaryValue), 10);

  // console.log(`signed: ${signed}`);
  // check if it was originally a negative value AND not in address mode
  if (signed < 0 && !addressMode) {
    return `${unsigned} (${signed})`;
  } else {
    // console.log(`addressMode: ${addressMode}`)
    // return `${unsigned}`;
  }
}

// TO-DO: make a function that keeps track of the input keyboard cursor
// because we change the input value on change, and the browser
// doesn't notice


function formatBinaryWithPadding(rawInput) {
  /* Adds a space every 4 digits (max: 3 spaces for a 16 bit number)
   */
  let formattedString = "";

  for (let i = 0; i < rawInput.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedString += " ";
    }
    formattedString += rawInput[i];
  }

  return formattedString;
}


export {
  getRawInput,
  preventNonBinaryDigits,
  padBinaryToFormat,
  displayASMValue,
  formatBinaryWithPadding
};
