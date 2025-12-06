/**
 * Represents an interactive CPU/RAM/INPUT/OUTPUT bus diagram
 *
 *  Assume the following svg IDs exist in the DOM:
 *  - bus-diagram
 *  - cpu-icon, ram-icon, input-icon, output-icon
 *  - cpu-lane, ram-lane, input-lane, output-lane
 */

class BusDiagram {
  #bus;
  #cpu;
  #ram;
  #input;
  #output;
  #cpuLane;
  #ramLane;
  #inputLane;
  #outputLane;
  #lanes;
  #componentIcons;

  constructor() {
    this.#bus = document.getElementById("bus-diagram");

    // icons
    this.#cpu = document.getElementById("cpu-icon");
    this.#ram = document.getElementById("ram-icon");
    this.#input = document.getElementById("input-icon");
    this.#output = document.getElementById("output-icon");

    // lanes
    this.#cpuLane = document.getElementById("cpu-lane");
    this.#ramLane = document.getElementById("ram-lane");
    this.#inputLane = document.getElementById("input-lane");
    this.#outputLane = document.getElementById("output-lane");

    this.#lanes = [
      this.#cpuLane,
      this.#ramLane,
      this.#inputLane,
      this.#outputLane,
    ];
    this.#componentIcons = [this.#cpu, this.#ram, this.#input, this.#output];
  }

  /**
   * setFlow
   * Utility method to set the correct flow of data from one component to the
   * other.
   *
   * Adds a CSS class to the main diagram indicating the flow direction;
   * the flow animation is handled by the CSS.
   *
   * Classes should follow the pattern: flow-{source}-{destination}
   *
   * @param {string} className
   * CSS class name to be added to demonstrate the data flow
   * Does not accept . prefix, just the raw className.
   *
   * @example
   * setFlow('flow-cpu-ram');    // CPU → RAM
   * setFlow('flow-input-cpu');  // INPUT → CPU
   *
   * Intended flows:
   * flow-cpu-input ; CPU → INPUT
   * flow-cpu-ram ; CPU → RAM
   * flow-ram-cpu ; RAM → CPU
   * flow-input-cpu ; INPUT → CPU
   *
   */

  setFlow(className) {
    this.#clearFlow();
    this.#bus.classList.add(className);
    this.#setActive(className);
  }

  #clearFlow() {
    void this.#bus.offsetWidth; // force browser to reflow another animation frame
    this.#bus.classList = "";
    this.#lanes.forEach((lane) => (lane.classList = ""));
  }

  // Check for the active components in the flow and add a CSS class
  #setActive(className) {
    this.#componentIcons
      .filter((icon) => {
        // @param icon : string, "<icon>-name"
        // console.log(`current icon is: ${icon.id}`);

        // Get the component nme from the class name.
        // example: flow-input-cpu → ['flow', 'input', 'cpu']
        // where the last two elements are always the components (so we slice it starting from index 1)
        const activeIcons = className
          .split("-")
          .slice(1)
          .map((component) => `${component}-icon`);
        return activeIcons.includes(icon.id);
      })
      .forEach((icon) => {
        icon.classList.add("active");
      });
  }
}

const busDiagram = new BusDiagram();

// busDiagram.setFlow("flow-input-cpu");
busDiagram.setFlow('flow-cpu-input');
// busDiagram.setFlow("flow-cpu-output");
// busDiagram.setFlow('flow-cpu-ram');
// busDiagram.setFlow('flow-ram-cpu');
