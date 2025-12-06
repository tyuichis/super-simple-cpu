/* Adds bits together.

Required to demonstrate overflow.

Refactor?: Another function handles converting binary to decimal within inputDisplay.js

*/

import { MEMORY_SIZE } from "./constants.js";

const sampleInput1 = "1100";
const sampleInput2 = "0100";
const sampleOutput = "10000";

function addBits(a, b) {
  /* Replicates binary long addition

      c
      a
    + b
    ---
      s

      where a, b are the binary inputs (as String),
      s is the sum,
      c is the carry (in/out)

      a ← "1100"
      b ← "0100"
      
      c → "1" (can change per bit column)
      s → "10000"

      Assume leading zero bits are added.
    */

  // ENSURE BITS ARE PADDED PROPERLY.
  // BECAUSE ACCUMULATOR BREAKS AS IT'S WRITTEN IN 12 BITS.
  // const BINARY_SIZE = Math.max(a.length, b.length);
  const formattedA = a.padStart(MEMORY_SIZE, "0");
  const formattedB = b.padStart(MEMORY_SIZE, "0");

  // 0 is a falsy value, so it works
  // although carry ← false would produce 0.
  // let's avoid javascript's type coercion

  let carry = 0;
  let finalSum = "";

  // since a and b will have the same length (padded bits);
  // either is fine to iterate
  // iterate BACKWARDS, from right to left.
  for (let i = MEMORY_SIZE - 1; i >= 0; i--) {
    const bitA = Number(formattedA[i]);
    const bitB = Number(formattedB[i]);

    // XOR ^ all the inputs together to produce the sum
    const sum = bitA ^ bitB ^ carry;

    // full adders uses OR gaters to calcualte the carry-in/out

    carry = (bitA && bitB) || (bitA && carry) || (bitB && carry);

    finalSum += String(sum);
  }

  // concatenation reverses the bit order, so I need to reverse it again.
  finalSum = finalSum.split("").reverse().join("");

  // if (carry) {
  //   // prepend the sum digit at the leftmost position
  //   finalSum = "1" + finalSum;
  // }

  // detect overflow so I can update the bus visualiser
  return {
    result: finalSum,
    carry: carry === 1 
  };

}

// tests
// console.log(addBits(sampleInput1, sampleInput2));
// console.log(addBits(sampleInput1, sampleInput2) == sampleOutput);

function subBits(a, b) {
  /*  Use two's complement addition to calculate subtraction

  Discard leading bits (overflow).

  1. Flip all bits of the subtrahend
  2. Add one to this new value called the "one's complement" number
  3. Add this new subtrahend with the original input
  */

  // 1. flip bits of the subtrahend, assume bits are padded

  // (max) OPERAND_SIZE is dependant on the memory size.

  // PAD THE BITS.
  const minuend = a.padStart(MEMORY_SIZE, "0");
  const subtrahend = b.padStart(MEMORY_SIZE, "0");

  // "onesComplement" is actually the name for flipping all the bits in the base 2 number
  let onesComplement = "";

  for (let i = 0; i < MEMORY_SIZE; i++) {
    if (subtrahend[i] === "0") {
      onesComplement += "1";
    } else {
      onesComplement += "0";
    }
  }

  // 2. add one
  const twosComplement = addBits(onesComplement, "1").result;

  // 3. add the minuend with the two's complement representation of the negative number
  const {result: difference, carry} = addBits(minuend, twosComplement);

  // discard extra bits by only copying from Right to Left, with size OPERAND_SIZE
  // const result = difference.slice(-OPERAND_SIZE);

  // console.log("ones complement:", onesComplement);
  // console.log("twos complement:", twosComplement);
  // console.log("difference (before slice):", difference);
  // console.log("result (after slice):", result);

  // detect underflow so I can update the bus visualiser
  return {
    result: difference,
    underflow: carry === false // addbits returns a bool
  };
}

// console.log("4 - 5 =", subBits("100", "101"));


/** convertBinaryToDecimal
 *
 * @param {string} operand
 *
 * @returns {string} unsigned or signed base 10 value in Two's Complement
 *
 *
 */

function convertBinaryToDecimal(operand) {
  const paddedBinary = operand.padStart(MEMORY_SIZE, "0");
  const sign = paddedBinary[0];

  // const TOTAL_BITS = operand.length;

  // Interpret the whole binary as a single value
  const unsignedValue = parseInt(paddedBinary, 2);

  if (sign == "1") {
    // Actual negative number = I - 2^n bits
    // where I is the unsigned value
    return String(unsignedValue - 2 ** MEMORY_SIZE);
  } else {
    return String(unsignedValue);
  }
}

/**
 * convertDecimalToBinary
 * 
 * Converts a decimal to binary and wraps around if overflow
 * 
 * @param {string} decimal 
 * @returns {string} binary 
 */

function convertDecimalToBinary(decimal) {
  let num = Number(decimal);

  if (isNaN(num)) return "".padStart(MEMORY_SIZE, "0");

  // check for overflow
  //  2^k bits - 1 for the max value
  const max = Math.pow(2, MEMORY_SIZE - 1) - 1;
  
  if (num > max) {
    // overflow occured, wrap around by offset
    num = num % (max + 1);
  }

  // slice off last 16 bits from javascript's default 32 unsigned bits
  if (num < 0) {
    return (num >>> 0).toString(2).slice(-MEMORY_SIZE);
  }

  return num.toString(2).padStart(MEMORY_SIZE, "0");
}

export { addBits, subBits, convertBinaryToDecimal, convertDecimalToBinary };
