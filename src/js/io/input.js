/* Manages input
 */

import { formatBinaryWithPadding, getRawInput, preventNonBinaryDigits } from "../ui/inputDisplay.js";
import { MEMORY_SIZE } from "../utils/constants.js";
import { decodeOperand } from "../utils/decode.js";

class InputModel {
  #inputValue;
  /*
    Model just has...

    value : "0000000000000000"

    We'll just extract out the operand when we update the view with the controller.
    */

  constructor() {
    this.#inputValue = "";
  }

  getInputValue() {
    return this.#inputValue;
  }

  setInputValue(value) {
    // sanitizing goes within controller.
    this.#inputValue = value;
  }
}

class InputView {
  #inputValue;
  #inputASMValue;
  #inputWrapper;

  constructor() {
    this.#inputValue = document.getElementById("io-input");
    this.#inputASMValue = document.getElementById("io-input-operand");
    this.#inputWrapper = document.getElementById('io-input-wrapper');
  }

  setInputASMValue(value) {
    // let this be handled by the controller
    // const operandDisplay = displayASMValue(value);
    this.#inputASMValue.textContent = value;
  }

  setInputValue(value) {
    this.#inputValue.value = value;
  }

  // wait for tooltip + prompt
  enablePrompt() {
    this.#inputWrapper.classList.add("tooltip");
    this.#inputWrapper.setAttribute("data-tooltip", "Type in & Press enter");

    setTimeout(() => {
      this.#inputWrapper.classList.add("active");
    }, 10);

    this.#inputValue.focus();
    // this.#inputValue.select();
  }

  disablePrompt() {
    this.#inputWrapper.classList.remove("active");
    setTimeout(() => {
      this.#inputWrapper.classList.remove("tooltip");
      this.#inputWrapper.removeAttribute("data-tooltip");
    }, 200);

    this.#inputValue.blur();
  }
}

class InputController {
  #model;
  #view;

  constructor() {
    this.#model = new InputModel();
    this.#view = new InputView();
    this.#setupEventListeners();
  }

  #setupEventListeners() {
    const input = document.getElementById("io-input");

    input.addEventListener("input", (e) => {
      // update text cursor too... (TO-DO)

      this.#handleInput(e);
    });
  }

  #handleInput(event) {
    /*
        apply a series of transformations to make sure input is in the correct display format and readable.
        */
    // don't allow non binary digits.
    let displayValue = event.target.value;
    displayValue = preventNonBinaryDigits(displayValue);
    // add spacing for readability
    displayValue = formatBinaryWithPadding(displayValue);
    event.target.value = displayValue;

    // input is _always_ data, so we don't need to interpret the instruction.
    // however... in future programs, we could... inject instructions?
    const operandBin = getRawInput(event.target.value);
    const paddedOperand = operandBin.padEnd(MEMORY_SIZE, "0");
    console.log(paddedOperand);
    
    const operand = decodeOperand("DAT", paddedOperand);
    
    this.#view.setInputASMValue(operand);
    this.#model.setInputValue(paddedOperand);
  }

  async read() {
    this.#view.enablePrompt();

    await new Promise((resolve) => {
      const inputElement = document.getElementById("io-input");

      const enterListener = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          inputElement.removeEventListener("keydown", enterListener);
          resolve();
        }
      };

      inputElement.addEventListener("keydown", enterListener);
    });

    this.#view.disablePrompt();

    return this.#model.getInputValue();
  }
}

export { InputController };
