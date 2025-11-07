/* Adds bits together.

Required to demonstrate overflow.

Refactor?: Another function handles converting binary to decimal within inputDisplay.js

*/

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

  // 0 is a falsy value, so it works
  // although carry ← false would produce 0.
  // let's avoid javascript's type coercion
  let carry = 0;
  let finalSum = "";

  const BINARY_SIZE = a.length;

  // since a and b will have the same length (padded bits);
  // either is fine to iterate
  // iterate BACKWARDS, from right to left.
  for (let i = BINARY_SIZE - 1; i >= 0; i--) {

    const bitA = Number(a[i]);
    const bitB = Number(b[i]);

    // XOR ^ all the inputs together to produce the sum
    const sum = bitA ^ bitB ^ carry;

    // full adders uses OR gaters to calcualte the carry-in/out

    carry =
      (bitA && bitB) ||
      (bitA && carry) ||
      (bitB && carry);

    finalSum += String(sum);
  }

  if (carry) {
    finalSum += 1;
  }

  // concatenation reverses the bit order, so I need to reverse it again.
  return finalSum.split("").reverse().join("");
}

// tests
console.log(addBits(sampleInput1, sampleInput2));
console.log(addBits(sampleInput1, sampleInput2) == sampleOutput);

// TO-DO: change this function to use two's complement
function convertBinaryToDecimal(operand) {
  /* operand: String
  where the last 12 bits correspond to the operand, i.e.
  
  1000 0000 0000 in
  
  0001 1000 0000 0000

  */

  const sign = operand[0];
  // parseInt(string, baseY) converts to base 10
  
  const value = parseInt(operand.slice(1), 2);

  if (sign == "1") {
    return String(-1 * value);
  } else {
    return String(value);
  }
}
