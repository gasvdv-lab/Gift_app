export function getUI() {
  const ids = [
    "status", "btnSelfTest", "btnReset",
    "versionValue", "platformValue", "moduleValue"
  ];
  const ui = {};
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Ontbrekend DOM-element: #${id}`);
    ui[id] = el;
  }
  return ui;
}

export function setStatus(element, message, kind = "") {
  element.textContent = message;
  element.className = `status ${kind}`.trim();
}
