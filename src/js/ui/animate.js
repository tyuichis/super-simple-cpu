/* Manages UI animations
 */

/*
Utility function to highlight our input boxes.
Used for highlighting memory cells and relevant registers.
*/

/*

WHY void element.offsetWidth?

The browser batches updates together. This means, when we activate an animation
by repeatingly adding/removing a CSS class,
the browser doesn't think a change occured, so the animation doesn'r
end up triggering.

by doing void element.offsetWidth, we force a reflow, as if the animation
never triggered at all; meaning we can proceed by adding the class and triggering
the animation as if it were a brand new change.

Solution and (probably better) explanation at:

https://stackoverflow.com/questions/60686489/what-purpose-does-void-element-offsetwidth-serve
*/

async function animateValChange(
  element,
  newValue,
  animationClassName = "register-update"
) {
  return new Promise((resolve) => {
    element.value = newValue;

    // cancel the animation. HOPEFULLY fix the race condition.
    element.classList.remove(animationClassName);

    // force re-paint, HOPEFULLY fix the race condition.
    void element.offsetWidth;

    element.classList.add(animationClassName);

    element.addEventListener(
      "animationend",
      () => {
        element.classList.remove(animationClassName);
        resolve();
      },
      { once: true }
    );
  });
}

// Just animate an input element value, i.e. Input.
// TO-DO make a separate animation?
async function animateVal(element, animationClassName = "register-update") {
  return new Promise((resolve) => {
    // cancel the animation. HOPEFULLY fix the race condition.
    element.classList.remove(animationClassName);

    // force re-paint, HOPEFULLY fix the race condition.
    void element.offsetWidth;

    element.classList.add(animationClassName);

    element.addEventListener(
      "animationend",
      () => {
        element.classList.remove(animationClassName);
        resolve();
      },
      { once: true }
    );
  });
}

export { animateVal, animateValChange };
