/* Manages output
 */

import { animateVal } from "../ui/animate.js";
import { formatBinaryWithPadding } from "../ui/inputDisplay.js";
import { convertBinaryToDecimal } from "../utils/binary.js";

class OutputModel {
    #outputValue;
    /*
    Model just has...

    value : "0000000000000000"

    We'll just extract out the operand when we update the view with the controller.
    */

    constructor() {
        this.#outputValue = "";
    }

    // we... probably don't need this. since nothing uses the output value.
    // HOWEVER, maybe for possible 'games' where we compare expected output = actual output
    getOutputValue() {
        return this.#outputValue;
    }

    setOutputValue(value) {
        // sanitizing goes within controller.
        this.#outputValue = value;
    }
}

class OutputView {
    #outputValue;
    #outputASMValue;

    constructor() {
        this.#outputValue = document.getElementById('io-output');
        this.#outputASMValue = document.getElementById('io-output-operand');
    }

    setOutputASMValue(value) {
        // let this be handled by the controller
        // const operandDisplay = displayASMValue(value);
        this.#outputASMValue.textContent = value;
    }

    setOutputValue(value) {
        const formattedValue = formatBinaryWithPadding(value);
        this.#outputValue.value = formattedValue;
    }
}

class OutputController {
    #model;
    #view;

    constructor() {
        this.#model = new OutputModel();
        this.#view = new OutputView();
    }

    async read() {
        // flash the output box.
        const output = document.getElementById('io-output');
        await animateVal(output);
        return this.#model.getOutputValue();
    }

    async write(value) {
        // flash the output box.
        const output = document.getElementById('io-output');
        await animateVal(output);

        // console.log(`value received is ${value}`);

        this.#model.setOutputValue(value);
        this.#view.setOutputValue(value);

        // The ASM value is always intepreted as Two's Complement, because it will
        // always will be `DAT` (inherits from accumulator, which is always `DAT` type)
        // const ASMValue = displayASMValue(value);
        const decimal = convertBinaryToDecimal(value);
        this.#view.setOutputASMValue(decimal);
    }

}

export { OutputController };
