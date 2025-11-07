/* Helper functions that get, sanitize and modify the input behavior
 */

// Intended usage:
// getRawInput → preventNonBinaryDigits → addBinaryPadding

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

function addBinaryPadding(binaryRawInput) {
  /* Add a space every 4 bits for readability
   */

  let binaryPaddedString = "";

  for (let i = 0; i < binaryRawInput.length; i++) {
    // Don't include a space in the beginning or end.
    if (i !== 0 && i % 4 === 0 && i !== binaryRawInput.length - 1) {
      binaryPaddedString += ` ${binaryRawInput[i]}`;
    } else {
      binaryPaddedString += binaryRawInput[i];
    }
  }

  return binaryPaddedString;
}

export { getRawInput, preventNonBinaryDigits, addBinaryPadding };
