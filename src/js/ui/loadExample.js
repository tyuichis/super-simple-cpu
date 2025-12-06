/* Loads examples from the textbook, and possibly new ones.

Add new examples within exampleList.js (for now).

*/

// Populate RAM cells with examples.

function displayExample(example) {
  // Only display the elements we need;
  for (let i = 0; i < example.length; i++) {
    // console.log(example);
    const memoryVal = document.getElementById(`mem-val-${i}`);
    const memoryLabel = document.getElementById(`mem-addr-label-${i}`);
    memoryVal.value = example[i]["mem-val"];
    memoryLabel.textContent = example[i]["mem-label"];
  }
}

export { displayExample };
