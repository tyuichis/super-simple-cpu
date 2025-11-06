/* Helper Functions */

function getRawInput(inputString) {
  return inputString.replaceAll(" ", "");
}

function preventNonBinaryDigits(rawInput) {
  /* Returns only the bits as a string
   */

  // only include 0 or 1
  let binaryDigits = "";

  for (let i = 0; i < rawInput.length; i++) {
    if (
      rawInput[i] === "0" ||
      rawInput[i] === "1"
    ) {
      binaryDigits += rawInput[i];
    }
  }

  return binaryDigits;
}

function formatInput(rawInput) {
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

function convertInputBinaryToDecimal(inputOperandBinary) {
  const sign = inputOperandBinary[0];
  // parseInt(string, baseY) converts to base 10
  const value = parseInt(inputOperandBinary.slice(1), 2);

  if (sign == "1") {
    return String(-1 * value);
  } else {
    return String(value);
  }
}

export { getRawInput, preventNonBinaryDigits, formatInput, convertInputBinaryToDecimal };
