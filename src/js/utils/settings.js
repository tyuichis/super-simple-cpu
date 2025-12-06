/*
Persist state on refresh using localStorage
*/

// Functional programming or OOP?
// This .js module concerns itself with state management, so OOP makes sense.

class AppState {
  #state;
  #localStorageKey = "app-settings";
  #sessionStorageKey = "app-settings";

  constructor(defaults) {
    /*
    load settings from localStorage, then merge existing settings if any.
    useful for when updates are pushed and user is exposed to new settings.
    */
    // const defaults = {
    //   compactMode: false,
    //   runSpeed: "normal",
    // };
    this.#state = { ...defaults, ...this.#load() };
    this.#initialiseUI();
  }

  getSetting(key) {
    return this.#state[key];
  }

  setSetting(key, value) {
    this.#state[key] = value;
    this.#save();
  }

  #load() {
    try {
      // if we don't have any localStorage settings yet... initialise it to an empty object
      const savedSettings = JSON.parse(localStorage.getItem("app-settings"));
      return savedSettings || {};
    } catch (error) {
      return {};
    }
  }

  #save() {
    localStorage.setItem(this.#localStorageKey, JSON.stringify(this.#state));
  }

  #initialiseUI() {
    this.#initCompactMode();
    this.#initRunSpeed();
    this.#initNav();
  }

  // Utility functions to sync UI state
  setRunSpeed(speed) {
    const htmlElement = document.querySelector("html");

    htmlElement.classList.remove("speed-normal", "speed-fast", "speed-instant");
    htmlElement.classList.add(`speed-${speed}`);

    this.setSetting("runSpeed", speed);
  }

  #initCompactMode() {
    const htmlElement = document.querySelector("html");

    // Compact Toggle
    const compactToggle = document.getElementById("compact-toggle");
    const isCompact = this.#state["compactMode"];
    compactToggle.checked = isCompact;
    // We can add a logical test as an argument to classList. Just like Excel. Cool.
    htmlElement.classList.toggle("compact-mode", isCompact);

    compactToggle.addEventListener("change", (_) => {
      const isCompact = compactToggle.checked;
      htmlElement.classList.toggle("compact-mode", isCompact);
      this.setSetting("compactMode", isCompact);
    });
  }

  #initRunSpeed() {
    const runSpeedSelect = document.querySelector("#run-speed");
    const runSpeed = this.#state["runSpeed"];
    runSpeedSelect.value = runSpeed;
    this.setRunSpeed(runSpeed);

    runSpeedSelect.addEventListener("change", (e) => {
      const speed = e.target.value.toLowerCase();
      this.setRunSpeed(speed);
      this.setSetting("runSpeed", speed);
    });
  }

  #initNav() {
    /*
    Use sessionStorage instead of localStorage, because
    users who don't use this app for awhile will want to see the nav bar on launch
    */

    const htmlElement = document.querySelector("html");
    const hideNavButton = document.getElementById("toggle-nav-view");

    const collapsed =
      sessionStorage.getItem(this.#sessionStorageKey) === "true";

    if (collapsed) {
      htmlElement.classList.add("hidden-nav");
      hideNavButton.textContent = "<";
      hideNavButton.dataset.tooltip = "Expand Navigation";
    } else {
      htmlElement.classList.remove("hidden-nav");
      hideNavButton.textContent = ">";
      hideNavButton.dataset.tooltip = "Collapse Navigation";
    }

    hideNavButton.addEventListener("click", () => {
      const isCollapsed = htmlElement.classList.toggle("hidden-nav");

      if (isCollapsed) {
        hideNavButton.textContent = "<";
        hideNavButton.dataset.tooltip = "Expand Navigation";
      } else {
        hideNavButton.textContent = ">";
        hideNavButton.dataset.tooltip = "Collapse Navigation";
      }

      sessionStorage.setItem(this.#sessionStorageKey, isCollapsed);
    });
  }
}

export { AppState };
