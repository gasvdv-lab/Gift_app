import{createGiftState}from"./gift-state.js";
import{cameraModule,startCamera,stopCamera}from"./camera.js";
import{
  recognitionModule,extractFeatures,saveReference,getReferences,clearReferences,
  getMaxReferences,qualityLabel,startRecognitionLoop,stopRecognitionLoop
}from"./recognition.js";
import{xrAdapterModule}from"./xr-adapter.js";
import{placementModule}from"./placement.js";
import{experienceModule}from"./experience.js";
import{rendererModule}from"./renderer.js";
import{assetModule}from"./assets.js";
import{getBasicCapabilities}from"./capabilities.js";
import{getUI,setHomeStatus}from"./ui.js";

const VERSION="0.4.0";
const BASELINE="0.2.0";
const modules=[cameraModule,recognitionModule,xrAdapterModule,placementModule,experienceModule,rendererModule,assetModule];

let ui,state,listenersBound=false;

function updateReferenceUI(){
  const count=getReferences().length;
  const text=`${count} / ${getMaxReferences()}`;
  ui.referenceCountHome.textContent=text;
  ui.referenceCountCamera.textContent=text;
  ui.btnCaptureReference.disabled=count>=getMaxReferences();
  ui.btnClearReferencesHome.disabled=count===0;
}

function resetDiagnostics(){
  ui.featureCountValue.textContent="—";
  ui.coverageValue.textContent="—";
  ui.qualityValue.textContent="—";
  ui.liveFeatureCountValue.textContent="—";
  ui.goodMatchesValue.textContent="—";
  ui.inliersValue.textContent="—";
  ui.confidenceValue.textContent="—";
  ui.scanBox.classList.remove("match");
}

function stopRecognition(){
  stopRecognitionLoop();
  state.recognitionStatus="idle";
  ui.btnToggleRecognition.textContent="Start herkennen";
  ui.recognitionFeedback.textContent="";
  ui.scanBox.classList.remove("match");
}

function setMode(mode){
  state.mode=mode;
  const register=mode==="register";
  ui.modeTitle.textContent=register?"Object registreren":"Object herkennen";
  ui.modeSubtitle.textContent=register
    ?"Plaats het object groot in het kader"
    :"Beweeg rond het geregistreerde object";
  ui.registerControls.classList.toggle("hidden",!register);
  ui.recognizeControls.classList.toggle("hidden",register);
  stopRecognition();
  resetDiagnostics();
}

async function enterCamera(mode){
  try{
    if(mode==="recognize"&&getReferences().length===0){
      setHomeStatus(ui.homeStatus,"Registreer eerst minstens één aanzicht.","warn");
      return;
    }

    setMode(mode);
    ui.homeView.hidden=true;
    ui.cameraView.classList.add("active");
    ui.cameraView.setAttribute("aria-hidden","false");
    ui.cameraStatus.textContent="Camera starten…";

    await startCamera(ui.cameraPreview);

    state.cameraStatus="running";
    ui.cameraStateValue.textContent="actief";
    ui.cameraStatus.textContent="Camera actief";
  }catch(error){
    console.error(error);
    await leaveCamera();
    setHomeStatus(
      ui.homeStatus,
      error?.name==="NotAllowedError"?"Cameratoegang geweigerd.":`Camera kon niet starten: ${error.message}`,
      "error"
    );
  }
}

async function leaveCamera(){
  stopRecognition();
  await stopCamera(ui.cameraPreview);
  state.cameraStatus="stopped";
  ui.cameraStateValue.textContent="gestopt";
  ui.cameraView.classList.remove("active");
  ui.cameraView.setAttribute("aria-hidden","true");
  ui.homeView.hidden=false;
  state.mode="home";
  updateReferenceUI();
}

function captureReference(){
  try{
    const profile=extractFeatures(ui.cameraPreview,ui.analysisCanvas);
    const count=profile.features.length;
    const coveragePct=Math.round(profile.coverage*100);
    const quality=qualityLabel(count,profile.coverage);

    ui.featureCountValue.textContent=String(count);
    ui.coverageValue.textContent=`${coveragePct}%`;
    ui.qualityValue.textContent=quality;

    const savedCount=saveReference(profile);
    updateReferenceUI();

    ui.recognitionFeedback.textContent=savedCount<getMaxReferences()
      ?`Aanzicht ${savedCount} opgeslagen — draai het object`
      :"Registratie compleet";
  }catch(error){
    console.error(error);
    ui.recognitionFeedback.textContent=error.message;
  }
}

function toggleRecognition(){
  if(state.recognitionStatus==="running"){
    stopRecognition();
    return;
  }

  try{
    state.recognitionStatus="running";
    ui.btnToggleRecognition.textContent="Stop herkennen";
    ui.recognitionFeedback.textContent="Kenmerken zoeken…";

    startRecognitionLoop({
      video:ui.cameraPreview,
      canvas:ui.analysisCanvas,
      onResult:({liveFeatureCount,goodMatches,inliers,confidence,matched,error})=>{
        if(error){
          console.error(error);
          ui.recognitionFeedback.textContent=`Fout: ${error.message}`;
          return;
        }

        ui.liveFeatureCountValue.textContent=String(liveFeatureCount);
        ui.goodMatchesValue.textContent=String(goodMatches);
        ui.inliersValue.textContent=String(inliers);
        ui.confidenceValue.textContent=confidence;

        if(matched){
          ui.recognitionFeedback.textContent="CADEAU HERKEND ✓";
          ui.scanBox.classList.add("match");
        }else{
          ui.recognitionFeedback.textContent="Zoeken…";
          ui.scanBox.classList.remove("match");
        }
      }
    });
  }catch(error){
    console.error(error);
    stopRecognition();
    ui.recognitionFeedback.textContent=error.message;
  }
}

function clearRegistration(){
  stopRecognition();
  clearReferences();
  updateReferenceUI();
  resetDiagnostics();
  setHomeStatus(ui.homeStatus,"Registratie gewist.","ok");
}

function runSelfTest(){
  try{
    const caps=getBasicCapabilities();
    if(!modules.every(m=>m.ready))throw new Error("Niet alle modules gereed.");
    setHomeStatus(
      ui.homeStatus,
      `Basistest geslaagd. Secure context: ${caps.secureContext?"ja":"nee"}. getUserMedia: ${caps.getUserMediaPresent?"ja":"nee"}. LocalStorage: ${caps.localStoragePresent?"ja":"nee"}.`,
      "ok"
    );
  }catch(error){
    setHomeStatus(ui.homeStatus,`Basistest mislukt: ${error.message}`,"error");
  }
}

function bindListeners(){
  if(listenersBound)return;

  ui.btnEnterRegister.addEventListener("click",()=>enterCamera("register"));
  ui.btnEnterRecognize.addEventListener("click",()=>enterCamera("recognize"));
  ui.btnBack.addEventListener("click",leaveCamera);
  ui.btnCaptureReference.addEventListener("click",captureReference);
  ui.btnToggleRecognition.addEventListener("click",toggleRecognition);
  ui.btnClearReferencesHome.addEventListener("click",clearRegistration);
  ui.btnSelfTest.addEventListener("click",runSelfTest);

  document.addEventListener("visibilitychange",()=>{
    if(document.hidden&&state.mode!=="home")leaveCamera();
  });

  window.addEventListener("pagehide",()=>{
    if(state?.mode!=="home")leaveCamera();
  });

  listenersBound=true;
}

function init(){
  ui=getUI();
  state=createGiftState();

  ui.versionValue.textContent=VERSION;
  ui.baselineValue.textContent=BASELINE;

  bindListeners();
  updateReferenceUI();
  resetDiagnostics();

  setHomeStatus(ui.homeStatus,`Gift AR v${VERSION} is correct gestart.`,"ok");
}

window.addEventListener("DOMContentLoaded",init,{once:true});
