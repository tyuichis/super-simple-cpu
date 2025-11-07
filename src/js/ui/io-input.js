/* Format the i/o numerical display
*/

import {
  getRawInput,
  preventNonBinaryDigits,
  addBinaryPadding,
} from "./inputDisplay.js";

// Usage, run displayFormattedIOInput(el) on every input.
function displayFormattedIOInput(ioInputElement) {
  const rawInputVal = getRawInput(ioInputElement.value);

  const binaryOnlyInput = preventNonBinaryDigits(rawInputVal);

  const paddedBinary = addBinaryPadding(binaryOnlyInput);

  ioInputElement.value = paddedBinary;
}

export { displayFormattedIOInput };
