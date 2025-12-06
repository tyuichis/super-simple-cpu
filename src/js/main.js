//  TO-DO: Fix input cursor jankiness (QoL) for inputs that format text:
// → memoryView, io-input...

// TO-DO: On next step button execution, create an anchor link w/ fragment id
// and click on it to force the viewport to jump to the correct address.
// low priority, since max cells = 16 (currently)

import { CPU } from "./cpu/cpu.js";

import { displayTabView } from "./ui/tabView.js";

import { clearApp, clearCPURegisters } from "./utils/clearApp.js";
import { loadMemory } from "./utils/loadMemory.js";
import { saveMemoryFile } from "./utils/saveMemory.js";

import { AppState } from "./utils/settings.js";

// initialise our app
const cpu = new CPU();

/*
  Settings
    Load user settings from localStorage
*/

// initialise our settings from localStorage
// the variable is not used; it just initialises state... should probably refactor later.
const appState = new AppState({
  compactMode: false,
  runSpeed: "normal",
  navCollapsed: false,
});

// i forget, but I may access this htmlelement somewhere...
// not enough time to refactor.
const htmlElement = document.querySelector("html");

// New user onboarding

// test onboarding
const isDemoMode = true;

const onboardingOverlay = document.getElementById("onboarding-overlay");
const startButton = document.getElementById("btn-start-app");

const STORAGE_KEY = "cpu-sim-onboarding-timestamp";
const EXPIRATION_HOURS = 48;
const EXPIRATION_MS = EXPIRATION_HOURS * 60 * 60 * 1000;

const lastSeen = JSON.parse(localStorage.getItem(STORAGE_KEY));
const now = Date.now();

// lastSeen doesn't exist if we never set the key in the first time (on onboard close anyways)
const shouldShow =
  !lastSeen || now - parseInt(lastSeen) > EXPIRATION_MS || isDemoMode;

if (shouldShow) {
  if (onboardingOverlay) onboardingOverlay.classList.remove("hidden");
}

if (startButton && onboardingOverlay) {
  const closeOnboarding = () => {
    onboardingOverlay.classList.add("hidden");
    // Store latest access time as a UNIX timestamp....
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  startButton.addEventListener("click", closeOnboarding);

  // Also if the user clicks out of the modal (the backdrop... close it)
  onboardingOverlay.addEventListener("click", (e) => {
    if (e.target === onboardingOverlay) {
      closeOnboarding();
    }
  });
}
/*
 App buttons eventListeners
*/

// Saving

const saveButton = document.getElementById("app-save");

saveButton.addEventListener("click", async () => {
  try {
    await saveMemoryFile();
  } catch (error) {
    console.error("Save failed:", error);
  }
});

const loadButton = document.getElementById("app-load");

loadButton.addEventListener("click", async () => {
  try {
    await loadMemory();
  } catch (error) {
    console.error(`Something wrong happened while loading memory: ${error}`);
  }
});

// Clear app memory eventListener
const clearButton = document.getElementById("app-clear");
clearButton.addEventListener("click", () => {
  const userConsent = window.confirm(
    "Do you really want to clear the app's memory?"
  );

  if (userConsent) {
    clearApp();
  }
});

const resetButton = document.getElementById("app-reset");
resetButton.addEventListener("click", () => {
  // RAM is preserved

  // GET PC first, then clear the last active memory slot
  cpu.resetActiveMemory();

  // wipe the registers
  clearCPURegisters();

  const logWindow = document.getElementById("log-window");
  logWindow.value = "";

  // clear the statuses.
  cpu.resetStatus();
  cpu.clearFetchExecuteCounter();
});

// ....... manually keep track of input cursor because the browser doesn't do it for us. (TO-DO)
function calculateNewCursorPos() {
  // have to read up on setSelectionRange mdn and calculate stuff.
}

// Required to play animations without breaking
// because animations are tied to 'animationend'
function switchToMainView() {
  const mainTabButton = document.getElementById("view-main-button");
  if (mainTabButton) {
    displayTabView(mainTabButton);
  }
}

const nextStepButton = document.getElementById("app-next-step");
nextStepButton.addEventListener("click", async () => {
  switchToMainView();
  await cpu.start();
  await cpu.step();
});

const autoRunButton = document.getElementById("app-run");

autoRunButton.addEventListener("click", async () => {
  if (!cpu.isRunning) {
    switchToMainView();
    await cpu.autoRun();
  }
});

const stopButton = document.getElementById("app-stop");
stopButton.addEventListener("click", () => {
  cpu.stop();
});

// compile assembly to binary

const assembleButton = document.getElementById("btn-assembly-to-binary");

assembleButton.addEventListener("click", (_) => {
  cpu.assemble();
});

// Navigation tab eventListener

document.querySelectorAll("#nav-tabs-group button").forEach((tabButton) => {
  tabButton.addEventListener("click", (e) => {
    displayTabView(e.target);
  });
});

// Global Hotkeys

window.addEventListener("keydown", (e) => {
  // if pressing CTRL or CMD i.e. to reload, don't run.
  if (e.metaKey) return;

  // do not activate on editable areas like inputs/textareas; assembly / log windows
  const element = e.target.tagName.toLowerCase();
  const isEditable =
    element === "input" || element === "textarea" || element.isContentEditable;

  if (isEditable) return;

  const key = e.key.toLowerCase();

  if (e.shiftKey && key === "r") {
    e.preventDefault();
    resetButton.click();
    return;
  }

  const hotkeys = {
    " ": nextStepButton,
    r: autoRunButton,
    escape: stopButton,
  };

  const keyTarget = hotkeys[key];

  // if hotkey exists, then let's click it.
  if (keyTarget) {
    e.preventDefault();
    keyTarget.click();
  }
});

// setup clipboard copy buttons

// TO-DO, add copy button animation?
// where text changes to "Copied!" and returns back to "Copy Output"
document.querySelectorAll(".clipboard-copy").forEach((btn) => {
  btn.addEventListener("click", async (_) => {
    const textarea = document.getElementById(btn.dataset.target);

    await navigator.clipboard.writeText(textarea.value);

    // Change the button text.

    const originalText = btn.textContent;
    btn.textContent = "Copied!";

    // wait a bit so the user can see the changed text content before it reverts back
    // to the original text.
    const ms = 1000;
    await new Promise((resolve) => setTimeout(resolve, ms));

    btn.textContent = originalText;
  });
});
