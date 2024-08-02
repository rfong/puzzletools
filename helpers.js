// Generic helpers

// shorthand for get element by id
export function getEl(id) {
  return document.getElementById(id);
}

// toggle for "hidden" class
export function setHidden(el, isHidden) {
  console.debug(`set el#${el.id} to hidden=${isHidden}`);
  setClass(el, "hidden", isHidden);
}

// toggle a class
export function setClass(el, className, condition) {
  if (condition) el.classList.add(className);
  else el.classList.remove(className);
}
