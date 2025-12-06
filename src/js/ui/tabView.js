/* Handles tab view

Clicking on a tab should hide the current view and enable the new view.

*/

function displayTabView(targetButtonElement) {
  const mainElement = document.querySelector("main");
  // get just the end of the string
  // on-main → main
  const currentViewName = mainElement.className.replace("on-", "");

  // format the targetViewName
  // "Log Window" → log-window
  const targetViewName = targetButtonElement.textContent
    .trim()
    .replaceAll(" ", "-")
    .toLowerCase();

  // console.log(targetViewName);

  // toggle and set correct class.
  if (currentViewName !== targetViewName) {
    // only run this when they're not the same to prevent flickering
    mainElement.classList.toggle(`on-${currentViewName}`);
    mainElement.classList.toggle(`on-${targetViewName}`);
  }
}

export { displayTabView };
