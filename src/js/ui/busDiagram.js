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
  #cpuRegisterLabel;
  #ramInfoLabel;
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

    // auxiliary labels
    this.#cpuRegisterLabel = document.getElementById("cpu-register-info");
    this.#ramInfoLabel = document.getElementById("ram-info");

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
   * other. It is asynchronous, so we can pause and wait until the animation finishes.
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
   * @param {string} label
   * This is the assembly (instruction + decimal interpretation) that
   * goes along with the data dot. They're always paired together, so
   * it makes sense to include it here.
   *
   * @example
   * setFlow('flow-cpu-ram', "STO 5");    // CPU → RAM
   * setFlow('flow-input-cpu', "DAT 1337");  // INPUT → CPU
   *
   * Intended flows:
   * flow-cpu-input ; CPU → INPUT
   * flow-cpu-ram ; CPU → RAM
   * flow-ram-cpu ; RAM → CPU
   * flow-input-cpu ; INPUT → CPU
   *
   */

  async setFlow(className, label) {
    this.clearFlow();

    if (!className || className === "flow-none") {
      return;
    }

    const dataPacket = this.#bus.querySelector("#data-packet");
    const dataLabel = this.#bus.querySelector("#data-binary");

    const { busDuration } = this.#getDurations();

    // try to fix race conditions when changing run speed
    // if (busDuration === 0) {
    //   if (label != null) dataLabel.textContent = label;
    //   this.#bus.classList.add(className);
    //   this.#setActive(className);
    //   // Force a tiny pause to allow the ui to update...
    //   await new Promise((resolve) => setTimeout(resolve, 10));
    //   return;
    // }

    if (label != null) dataLabel.textContent = label;

    // remove last animations before adding new ones
    // this fixes the 'rubberbanding' where the dot tries to move to the starting position
    // of the animation, then starts animating.
    if (dataPacket) {
      dataPacket.getAnimations().forEach((animation) => animation.cancel());
    }

    // Use Web Animation API to avoid janky double RAF technique to solve
    // race conditions

    this.#bus.classList.add(className);
    this.#setActive(className);

    void this.#bus.offsetWidth;

    // Same as "travel" animation from the _busDiagram.css, see MDN for more details about the Web Animation API
    const keyframes = [
      { offsetDistance: "0%", opacity: 0 },
      { offsetDistance: "5%", opacity: 1, offset: 0.05 },
      { offsetDistance: "100%", opacity: 1, offset: 0.9 },
      { offsetDistance: "100%", opacity: 0 },
    ];

    const timing = {
      duration: busDuration, // ms
      iterations: 1,
      fill: "forwards",
      easing: "linear",
    };

    const animation = dataPacket.animate(keyframes, timing);

    await animation.finished;
  }

  // displays updates done within the CPU registers... i.e. acc= ... ; IR = ... ;

  async #animateLabel(element, text) {
    if (!element) return;

    element.getAnimations().forEach((anim) => anim.cancel());

    element.textContent = text;

    const { labelDuration } = this.#getDurations();

    // if (labelDuration === 0) {
    //   await new Promise((r) => setTimeout(r, 20));
    //   element.textContent = "";
    //   return;
    // }

    const keyframes = [
      {
        opacity: 0,
        transform: "translateY(3px)",
        offset: 0,
        easing: "cubic-bezier(0.075, 0.82, 0.165, 1)",
      },
      { opacity: 1, transform: "translateY(-4px)", offset: 0.2 },
      { opacity: 1, transform: "translateY(-3px)", offset: 0.3 },
      { opacity: 1, transform: "translateY(-3px)", offset: 0.9 },
      { opacity: 0, transform: "translateY(-6px)", offset: 1 },
    ];

    const timing = {
      duration: labelDuration,
      iterations: 1,
      fill: "forwards",
    };

    const animation = element.animate(keyframes, timing);

    await animation.finished;
    element.textContent = "";
  }

  // Optional awaits because I want to control the animation timing (very jankily)

  // For CPU (ACC / IR updates)
  async setRegisterLabel(labelText) {
    return this.#animateLabel(this.#cpuRegisterLabel, labelText);
  }

  // For RAM (write to memory)
  async setRamLabel(labelText) {
    return this.#animateLabel(this.#ramInfoLabel, labelText);
  }

  // async setRegisterLabel(label) {
  //   return new Promise((resolve) => {
  //     this.#cpuRegisterInfo = label;
  //     resolve();
  //   });
  // }

  // async clearRegisterLabel() {
  //   return new Promise((resolve) => {
  //     this.#cpuRegisterInfo = '';
  //     resolve();
  //   });
  // }

  clearFlow() {
    void this.#bus.offsetWidth; // force browser to reflow another animation frame
    this.#bus.classList = ""; // clear flow state
    this.#lanes.forEach((lane) => (lane.classList = "")); // clear lanes
    this.#componentIcons.forEach((icon) => (icon.classList = "")); // clear 'active' status
  }

  // Helper to get durations based on the control panel speed setting
  #getDurations() {
    const runSpeed =
      JSON.parse(localStorage.getItem("app-settings"))?.runSpeed || "normal";

    // Defaults; normal speed
    let busDuration = 2500;
    let labelDuration = 1200;

    if (runSpeed === "fast") {
      busDuration = 600;
      labelDuration = 400;
    } else if (runSpeed === "instant") {
      // Instant: 0ms
      busDuration = 0;
      labelDuration = 0;
    }

    return { busDuration, labelDuration };
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

// const busDiagram = new BusDiagram();

// tests
// busDiagram.setFlow("flow-input-cpu");
// busDiagram.setFlow("flow-cpu-input");
// busDiagram.setFlow("flow-cpu-output");
// busDiagram.setFlow('flow-cpu-ram');
// busDiagram.setFlow('flow-ram-cpu');

export { BusDiagram };
