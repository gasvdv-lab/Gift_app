import {createGiftState} from "./gift-state.js";
import {cameraModule,startCamera,stopCamera,isCameraRunning} from "./camera.js";
import {recognitionModule} from "./recognition.js";
import {xrAdapterModule} from "./xr-adapter.js";
import {placementModule} from "./placement.js";
import {experienceModule} from "./experience.js";
import {rendererModule} from "./renderer.js";
import {assetModule} from "./assets.js";
import {getBasicCapabilities} from "./capabilities.js";
import {getUI,setStatus,setCameraPlaceholder} from "./ui.js";
const VERSION="0.2.0",STABLE_BASELINE="0.1.0";
const modules=[cameraModule,recognitionModule,xrAdapterModule,placementModule,experienceModule,rendererModule,assetModule];
let ui,state,listenersBound=false;
function updateCameraUI(){const running=isCameraRunning();state.cameraStatus=running?"running":"stopped";ui.cameraStateValue.textContent=running?"actief":"gestopt";setCameraPlaceholder(ui.cameraPlaceholder,!running);ui.btnStartCamera.disabled=running;ui.btnStopCamera.disabled=!running;}
async function handleStartCamera(){try{setStatus(ui.status,"Camera wordt gestart…");await startCamera(ui.cameraPreview);updateCameraUI();setStatus(ui.status,"Camera actief.","ok");}catch(error){console.error(error);updateCameraUI();let message="Camera kon niet worden gestart.";if(error?.name==="NotAllowedError")message="Cameratoegang is geweigerd. Geef Chrome toestemming voor de camera.";else if(error?.name==="NotFoundError")message="Geen geschikte camera gevonden.";else if(error?.message)message=`Camera kon niet worden gestart: ${error.message}`;setStatus(ui.status,message,"error");}}
async function handleStopCamera(){try{await stopCamera(ui.cameraPreview);updateCameraUI();setStatus(ui.status,"Camera gestopt.","ok");}catch(error){console.error(error);setStatus(ui.status,`Camera kon niet correct stoppen: ${error.message}`,"error");}}
async function handleRestartCamera(){try{setStatus(ui.status,"Camera wordt herstart…");await stopCamera(ui.cameraPreview);await startCamera(ui.cameraPreview);updateCameraUI();setStatus(ui.status,"Camera opnieuw gestart.","ok");}catch(error){console.error(error);updateCameraUI();setStatus(ui.status,`Herstart mislukt: ${error.message}`,"error");}}
function runSelfTest(){try{const c=getBasicCapabilities();if(!modules.every(m=>m.ready===true))throw new Error("Niet alle modules zijn gereed.");setStatus(ui.status,["Basistest geslaagd.",`HTTPS/secure context: ${c.secureContext?"ja":"nee"}.`,`WebXR API aanwezig: ${c.webxrApiPresent?"ja":"nee"}.`,`MediaDevices aanwezig: ${c.mediaDevicesPresent?"ja":"nee"}.`,`getUserMedia aanwezig: ${c.getUserMediaPresent?"ja":"nee"}.`].join(" "),"ok");}catch(error){console.error(error);setStatus(ui.status,`Basistest mislukt: ${error.message}`,"error");}}
function resetStatus(){setStatus(ui.status,`Gift AR v${VERSION} is actief.`);}
async function cleanupCamera(reason=""){if(!ui)return;try{await stopCamera(ui.cameraPreview);updateCameraUI();if(reason)setStatus(ui.status,reason);}catch(error){console.error("Camera cleanup mislukt:",error);}}
function bindListeners(){if(listenersBound)return;ui.btnStartCamera.addEventListener("click",handleStartCamera);ui.btnStopCamera.addEventListener("click",handleStopCamera);ui.btnRestartCamera.addEventListener("click",handleRestartCamera);ui.btnSelfTest.addEventListener("click",runSelfTest);ui.btnReset.addEventListener("click",resetStatus);document.addEventListener("visibilitychange",()=>{if(document.hidden&&isCameraRunning())cleanupCamera("Camera gestopt omdat de pagina naar de achtergrond ging.");});window.addEventListener("pagehide",()=>{cleanupCamera();});listenersBound=true;}
function initialize(){ui=getUI();state=createGiftState();ui.versionValue.textContent=VERSION;ui.baselineValue.textContent=STABLE_BASELINE;ui.platformValue.textContent=navigator.userAgent;ui.moduleValue.textContent=`${modules.length} modules geladen`;bindListeners();updateCameraUI();setStatus(ui.status,`Gift AR v${VERSION} is correct gestart.`,"ok");}
window.addEventListener("DOMContentLoaded",initialize,{once:true});
