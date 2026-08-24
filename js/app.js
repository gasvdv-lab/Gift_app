import { createGiftState } from "./gift-state.js";
import { cameraModule } from "./camera.js";
import { recognitionModule } from "./recognition.js";
import { xrAdapterModule } from "./xr-adapter.js";
import { placementModule } from "./placement.js";
import { experienceModule } from "./experience.js";
import { rendererModule } from "./renderer.js";
import { assetModule } from "./assets.js";
import { getBasicCapabilities } from "./capabilities.js";
import { getUI, setStatus } from "./ui.js";

const VERSION = "0.1.0";
const modules = [
  cameraModule,
  recognitionModule,
  xrAdapterModule,
  placementModule,
  experienceModule,
  rendererModule,
  assetModule
];

let ui;
let state;

function initialize() {
  ui = getUI();
  state = createGiftState();

  ui.versionValue.textContent = VERSION;
  ui.platformValue.textContent = navigator.userAgent;
  ui.moduleValue.textContent = `${modules.length} modules geladen`;

  ui.btnSelfTest.addEventListener("click", runSelfTest);
  ui.btnReset.addEventListener("click", resetStatus);

  setStatus(ui.status, `Gift AR v${VERSION} is correct gestart.`, "ok");
}

function runSelfTest() {
  try {
    const capabilities = getBasicCapabilities();
    const modulesReady = modules.every(module => module.ready === true);
    if (!modulesReady) throw new Error("Niet alle modules zijn gereed.");

    const result = [
      "Basistest geslaagd.",
      `HTTPS/secure context: ${capabilities.secureContext ? "ja" : "nee"}.`,
      `WebXR API aanwezig: ${capabilities.webxrApiPresent ? "ja" : "nee"}.`,
      `MediaDevices aanwezig: ${capabilities.mediaDevicesPresent ? "ja" : "nee"}.`
    ].join(" ");

    setStatus(ui.status, result, "ok");
  } catch (error) {
    console.error(error);
    setStatus(ui.status, `Basistest mislukt: ${error.message}`, "error");
  }
}

function resetStatus() {
  setStatus(ui.status, `Gift AR v${VERSION} is actief.`);
}

window.addEventListener("DOMContentLoaded", initialize, { once: true });
