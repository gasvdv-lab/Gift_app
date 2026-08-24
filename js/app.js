import { createGiftState } from "./gift-state.js";
import { cameraModule, startCamera, stopCamera, isCameraRunning } from "./camera.js";
import {
  recognitionModule,
  createDescriptor,
  saveReference,
  getReferences,
  clearReferences,
  getMaxReferences,
  getThreshold,
  startRecognitionLoop,
  stopRecognitionLoop
} from "./recognition.js";
import { xrAdapterModule } from "./xr-adapter.js";
import { placementModule } from "./placement.js";
import { experienceModule } from "./experience.js";
import { rendererModule } from "./renderer.js";
import { assetModule } from "./assets.js";
import { getBasicCapabilities } from "./capabilities.js";
import { getUI, setStatus, setCameraPlaceholder } from "./ui.js";

const VERSION = "0.3.0";
const STABLE_BASELINE = "0.2.0";

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
let listenersBound = false;

function updateReferenceUI() {
  const refs = getReferences();
  ui.referenceCountValue.textContent = `${refs.length} / ${getMaxReferences()}`;
  ui.btnCaptureReference.disabled = !isCameraRunning() || refs.length >= getMaxReferences();
  ui.btnStartRecognition.disabled = !isCameraRunning() || refs.length === 0 || state.recognitionStatus === "running";
  ui.btnStopRecognition.disabled = state.recognitionStatus !== "running";
  ui.btnClearReferences.disabled = refs.length === 0;
}

function updateCameraUI() {
  const running = isCameraRunning();
  state.cameraStatus = running ? "running" : "stopped";
  ui.cameraStateValue.textContent = running ? "actief" : "gestopt";
  setCameraPlaceholder(ui.cameraPlaceholder, !running);

  ui.btnStartCamera.disabled = running;
  ui.btnStopCamera.disabled = !running;

  if (!running) {
    stopRecognition();
  }

  updateReferenceUI();
}

function stopRecognition(message = "") {
  stopRecognitionLoop();
  state.recognitionStatus = "idle";
  ui.recognitionStateValue.textContent = "inactief";
  ui.similarityValue.textContent = "—";
  updateReferenceUI();

  if (message) {
    setStatus(ui.status, message);
  }
}

async function handleStartCamera() {
  try {
    setStatus(ui.status, "Camera wordt gestart…");
    await startCamera(ui.cameraPreview);
    updateCameraUI();
    setStatus(ui.status, "Camera actief.", "ok");
  } catch (error) {
    console.error(error);
    updateCameraUI();

    let message = "Camera kon niet worden gestart.";
    if (error?.name === "NotAllowedError") {
      message = "Cameratoegang is geweigerd. Geef Chrome toestemming voor de camera.";
    } else if (error?.name === "NotFoundError") {
      message = "Geen geschikte camera gevonden.";
    } else if (error?.message) {
      message = `Camera kon niet worden gestart: ${error.message}`;
    }

    setStatus(ui.status, message, "error");
  }
}

async function handleStopCamera() {
  try {
    stopRecognition();
    await stopCamera(ui.cameraPreview);
    updateCameraUI();
    setStatus(ui.status, "Camera gestopt.", "ok");
  } catch (error) {
    console.error(error);
    setStatus(ui.status, `Camera kon niet correct stoppen: ${error.message}`, "error");
  }
}

async function handleRestartCamera() {
  try {
    stopRecognition();
    setStatus(ui.status, "Camera wordt herstart…");
    await stopCamera(ui.cameraPreview);
    await startCamera(ui.cameraPreview);
    updateCameraUI();
    setStatus(ui.status, "Camera opnieuw gestart.", "ok");
  } catch (error) {
    console.error(error);
    updateCameraUI();
    setStatus(ui.status, `Herstart mislukt: ${error.message}`, "error");
  }
}

function handleCaptureReference() {
  try {
    if (!isCameraRunning()) {
      throw new Error("Start eerst de camera.");
    }

    const descriptor = createDescriptor(ui.cameraPreview, ui.analysisCanvas);
    const count = saveReference(descriptor);
    updateReferenceUI();

    const remaining = getMaxReferences() - count;
    if (remaining > 0) {
      setStatus(
        ui.status,
        `Aanzicht ${count} geregistreerd. Draai het object en registreer nog ${remaining}.`,
        "ok"
      );
    } else {
      setStatus(
        ui.status,
        "Drie aanzichten geregistreerd. Je kunt nu herkenning testen.",
        "ok"
      );
    }
  } catch (error) {
    console.error(error);
    setStatus(ui.status, error.message, "error");
  }
}

function handleStartRecognition() {
  try {
    if (!isCameraRunning()) {
      throw new Error("Start eerst de camera.");
    }

    state.recognitionStatus = "running";
    ui.recognitionStateValue.textContent = "scannen";
    updateReferenceUI();
    setStatus(ui.status, "Herkenning actief. Richt op het geregistreerde object.");

    startRecognitionLoop({
      video: ui.cameraPreview,
      canvas: ui.analysisCanvas,
      onResult: ({ similarity, matched, error }) => {
        if (error) {
          console.error(error);
          setStatus(ui.status, `Herkenningsfout: ${error.message}`, "error");
          return;
        }

        const pct = Math.round(similarity * 100);
        ui.similarityValue.textContent = `${pct}%`;

        if (matched) {
          ui.recognitionStateValue.textContent = "CADEAU HERKEND";
          setStatus(ui.status, `Cadeau herkend — overeenkomst ${pct}%.`, "ok");
        } else {
          ui.recognitionStateValue.textContent = "zoeken";
          setStatus(ui.status, `Nog geen betrouwbare match — ${pct}%.`, "warn");
        }
      }
    });
  } catch (error) {
    state.recognitionStatus = "idle";
    updateReferenceUI();
    console.error(error);
    setStatus(ui.status, error.message, "error");
  }
}

function handleStopRecognition() {
  stopRecognition("Herkenning gestopt.");
}

function handleClearReferences() {
  stopRecognition();
  clearReferences();
  updateReferenceUI();
  setStatus(ui.status, "Registratie gewist.", "ok");
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
      `MediaDevices aanwezig: ${capabilities.mediaDevicesPresent ? "ja" : "nee"}.`,
      `getUserMedia aanwezig: ${capabilities.getUserMediaPresent ? "ja" : "nee"}.`,
      `LocalStorage beschikbaar: ${capabilities.localStoragePresent ? "ja" : "nee"}.`
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

async function cleanupCamera(reason = "") {
  if (!ui) return;

  try {
    stopRecognition();
    await stopCamera(ui.cameraPreview);
    updateCameraUI();

    if (reason) {
      setStatus(ui.status, reason);
    }
  } catch (error) {
    console.error("Camera cleanup mislukt:", error);
  }
}

function bindListeners() {
  if (listenersBound) return;

  ui.btnStartCamera.addEventListener("click", handleStartCamera);
  ui.btnStopCamera.addEventListener("click", handleStopCamera);
  ui.btnRestartCamera.addEventListener("click", handleRestartCamera);
  ui.btnCaptureReference.addEventListener("click", handleCaptureReference);
  ui.btnStartRecognition.addEventListener("click", handleStartRecognition);
  ui.btnStopRecognition.addEventListener("click", handleStopRecognition);
  ui.btnClearReferences.addEventListener("click", handleClearReferences);
  ui.btnSelfTest.addEventListener("click", runSelfTest);
  ui.btnReset.addEventListener("click", resetStatus);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && isCameraRunning()) {
      cleanupCamera("Camera gestopt omdat de pagina naar de achtergrond ging.");
    }
  });

  window.addEventListener("pagehide", () => {
    cleanupCamera();
  });

  listenersBound = true;
}

function initialize() {
  ui = getUI();
  state = createGiftState();

  ui.versionValue.textContent = VERSION;
  ui.baselineValue.textContent = STABLE_BASELINE;
  ui.platformValue.textContent = navigator.userAgent;
  ui.moduleValue.textContent = `${modules.length} modules geladen`;
  ui.thresholdValue.textContent = `${Math.round(getThreshold() * 100)}%`;

  bindListeners();
  updateCameraUI();
  updateReferenceUI();

  setStatus(ui.status, `Gift AR v${VERSION} is correct gestart.`, "ok");
}

window.addEventListener("DOMContentLoaded", initialize, { once: true });
