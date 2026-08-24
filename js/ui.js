export function getUI() {
  const ids = [
    "status",
    "cameraPreview",
    "cameraPlaceholder",
    "analysisCanvas",
    "btnStartCamera",
    "btnStopCamera",
    "btnRestartCamera",
    "btnCaptureReference",
    "btnStartRecognition",
    "btnStopRecognition",
    "btnClearReferences",
    "btnSelfTest",
    "btnReset",
    "versionValue",
    "baselineValue",
    "platformValue",
    "moduleValue",
    "cameraStateValue",
    "referenceCountValue",
    "recognitionStateValue",
    "similarityValue",
    "thresholdValue"
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

export function setCameraPlaceholder(element, visible) {
  element.classList.toggle("hidden", !visible);
}
