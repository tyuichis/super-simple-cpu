/* Clear every slot in the memory to its default
 */

function clearApp() {
  // Clear i/o
  const ioInput = document.getElementById("io-input");
  const ioOutput = document.getElementById("io-output");
  ioInput.value = "";
  ioOutput.value = "";

  // Clear CPU registers
  document.querySelectorAll("#cpu input").forEach((input) => {
    input.value = "";
  });

  // Clear memory
  for (let i = 0; i <= 15; i++) {
    const memAddrLabel = document.getElementById(`mem-addr-label-${i}`);
    const memAddr = document.getElementById(`mem-addr-${i}`);
    const memVal = document.getElementById(`mem-val-${i}`);

    memAddrLabel.value = "";
    memAddr.value = "";
    memVal.value = "";
  }
}

export { clearApp };