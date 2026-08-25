import{cameraModule,startCamera,stopCamera}from"./camera.js";
import{registrationModule,loadProfile,addView,removeView,finishProfile,getLimits,freezeVisibleFrame,cropSelection}from"./registration.js";
import{objectIsolationModule,isolateObject}from"./object-isolation.js";
import{aiAssistanceModule,describeIsolationCapability}from"./ai-assistance.js";
import{recognitionModule}from"./recognition.js";
import{giftStateModule}from"./gift-state.js";
import{xrAdapterModule}from"./xr-adapter.js";
import{placementModule}from"./placement.js";
import{experienceModule}from"./experience.js";
import{rendererModule}from"./renderer.js";
import{assetsModule}from"./assets.js";
import{capabilitiesModule,getCapabilities}from"./capabilities.js";
import{getUI,setStatus}from"./ui.js";

const VERSION="0.6.0";
const BASELINE="0.2.0";

const modules=[
  cameraModule,registrationModule,objectIsolationModule,aiAssistanceModule,recognitionModule,
  giftStateModule,xrAdapterModule,placementModule,experienceModule,rendererModule,assetsModule,
  capabilitiesModule
];

let ui;
let mode="home";
let drag=null;
let selection=null;
let currentCrop=null;
let currentIsolation=null;
let listenersBound=false;

function profile(){return loadProfile()}

function updateHome(){
  const p=profile();
  const limits=getLimits();
  const count=p.views.length;

  ui.referenceCountHome.textContent=`${count} / ${limits.max}`;
  ui.galleryCountValue.textContent=`${count} / ${limits.max}`;
  ui.btnShowGallery.disabled=count===0;
  ui.btnFinishRegistration.disabled=count<limits.min;
  ui.btnContinueRegistration.disabled=count>=limits.max;
  ui.moduleCountValue.textContent=`${modules.length} modules`;

  if(p.status==="completed")ui.registrationStateValue.textContent="afgerond";
  else if(count>=limits.min)ui.registrationStateValue.textContent="klaar om af te ronden";
  else if(count>0)ui.registrationStateValue.textContent=`nog ${limits.min-count} nodig`;
  else ui.registrationStateValue.textContent="leeg";

  renderGallery();
}

function renderGallery(){
  const p=profile();
  ui.galleryGrid.innerHTML="";

  p.views.forEach(view=>{
    const item=document.createElement("article");
    item.className="gallery-item";

    const img=document.createElement("img");
    img.src=view.isolation?.accepted && view.isolation?.isolatedDataUrl
      ? view.isolation.isolatedDataUrl
      : view.manualCropDataUrl;
    img.alt=`Aanzicht ${view.order}`;

    const meta=document.createElement("div");
    meta.className="gallery-item-meta";
    const modeText=view.isolation?.accepted?"isolatie":"handmatige crop";
    meta.innerHTML=`<span>Aanzicht ${view.order}</span><span>${modeText}</span>`;

    const del=document.createElement("button");
    del.type="button";
    del.className="danger";
    del.textContent="Verwijderen";
    del.addEventListener("click",()=>{
      removeView(view.id);
      updateHome();
      setStatus(ui.homeStatus,"Aanzicht verwijderd.","ok");
    });

    item.append(img,meta,del);
    ui.galleryGrid.append(item);
  });
}

function showGallery(){
  updateHome();
  ui.galleryCard.classList.toggle("hidden");
}

function resetCaptureState(){
  selection=null;
  drag=null;
  currentCrop=null;
  currentIsolation=null;

  ui.cameraView.classList.remove("frozen");
  ui.selectionLayer.classList.add("hidden");
  ui.selectionBox.classList.add("hidden");
  ui.captureControls.classList.remove("hidden");
  ui.selectControls.classList.add("hidden");
  ui.isolationControls.classList.add("hidden");
  ui.afterSaveControls.classList.add("hidden");
  ui.cameraFeedback.textContent="";
}

async function enterRegistration(){
  try{
    const p=profile();
    const limits=getLimits();

    if(p.views.length>=limits.max){
      setStatus(ui.homeStatus,"Maximum van 5 aanzichten bereikt.","warn");
      ui.galleryCard.classList.remove("hidden");
      return;
    }

    mode="camera";
    resetCaptureState();
    ui.homeView.hidden=true;
    ui.cameraView.classList.add("active");
    ui.cameraView.setAttribute("aria-hidden","false");
    ui.modeTitle.textContent="Neem een foto";
    ui.modeSubtitle.textContent=`Aanzicht ${p.views.length+1} — laat het cadeau duidelijk zien`;
    ui.viewCounterTop.textContent=`${p.views.length} / ${limits.max}`;
    ui.cameraFeedback.textContent="Camera starten…";

    await startCamera(ui.cameraPreview);
    ui.cameraStateValue.textContent="actief";
    ui.cameraFeedback.textContent="";
  }catch(error){
    console.error(error);
    await leaveRegistration();
    setStatus(ui.homeStatus,`Camera kon niet starten: ${error.message}`,"error");
  }
}

async function leaveRegistration(){
  await stopCamera(ui.cameraPreview);
  mode="home";
  selection=null;
  drag=null;
  currentCrop=null;
  currentIsolation=null;

  ui.cameraStateValue.textContent="gestopt";
  ui.cameraView.classList.remove("active","frozen");
  ui.cameraView.setAttribute("aria-hidden","true");
  ui.homeView.hidden=false;
  updateHome();
}

function takePhoto(){
  try{
    freezeVisibleFrame(ui.cameraPreview,ui.frozenCanvas);
    ui.cameraView.classList.add("frozen");
    mode="select";
    ui.captureControls.classList.add("hidden");
    ui.selectControls.classList.remove("hidden");
    ui.selectionLayer.classList.remove("hidden");
    ui.selectionBox.classList.add("hidden");
    ui.modeTitle.textContent="Duid je cadeau aan";
    ui.modeSubtitle.textContent="Selecteer alleen het cadeau";
    ui.cameraFeedback.textContent="Trek met je vinger een rechthoek rond het cadeau.";
  }catch(error){
    ui.cameraFeedback.textContent=error.message;
  }
}

function resetSelection(){
  selection=null;
  currentCrop=null;
  currentIsolation=null;
  ui.selectionBox.classList.add("hidden");
  ui.cameraFeedback.textContent="Maak een nieuwe selectie.";
}

function rectFromPoints(x1,y1,x2,y2){
  return {
    left:Math.min(x1,x2),
    top:Math.min(y1,y2),
    width:Math.abs(x2-x1),
    height:Math.abs(y2-y1)
  };
}

function applySelection(){
  if(!selection)return;
  const layer=ui.selectionLayer.getBoundingClientRect();
  ui.selectionBox.style.left=`${selection.left-layer.left}px`;
  ui.selectionBox.style.top=`${selection.top-layer.top}px`;
  ui.selectionBox.style.width=`${selection.width}px`;
  ui.selectionBox.style.height=`${selection.height}px`;
  ui.selectionBox.classList.remove("hidden");
}

function pointerDown(e){
  if(mode!=="select")return;

  const handle=e.target?.dataset?.handle;

  if(handle&&selection){
    drag={type:"resize",handle,initial:{...selection}};
  }else{
    drag={type:"new",startX:e.clientX,startY:e.clientY};
    selection={left:e.clientX,top:e.clientY,width:0,height:0};
  }

  ui.selectionLayer.setPointerCapture?.(e.pointerId);
  e.preventDefault();
}

function pointerMove(e){
  if(!drag||mode!=="select")return;

  if(drag.type==="new"){
    selection=rectFromPoints(drag.startX,drag.startY,e.clientX,e.clientY);
  }else{
    const i=drag.initial;
    let left=i.left,top=i.top,right=i.left+i.width,bottom=i.top+i.height;
    if(drag.handle.includes("n"))top=e.clientY;
    if(drag.handle.includes("s"))bottom=e.clientY;
    if(drag.handle.includes("w"))left=e.clientX;
    if(drag.handle.includes("e"))right=e.clientX;
    selection=rectFromPoints(left,top,right,bottom);
  }

  const layer=ui.selectionLayer.getBoundingClientRect();
  selection.left=Math.max(layer.left,Math.min(selection.left,layer.right-20));
  selection.top=Math.max(layer.top,Math.min(selection.top,layer.bottom-20));
  selection.width=Math.min(selection.width,layer.right-selection.left);
  selection.height=Math.min(selection.height,layer.bottom-selection.top);

  applySelection();
  e.preventDefault();
}

function pointerUp(e){
  if(!drag)return;
  drag=null;

  if(selection&&selection.width>=40&&selection.height>=40){
    ui.cameraFeedback.textContent="Selectie gemaakt. Pas indien nodig de hoekpunten aan.";
  }else{
    resetSelection();
    ui.cameraFeedback.textContent="Selectie te klein. Probeer opnieuw.";
  }

  try{ui.selectionLayer.releasePointerCapture?.(e.pointerId)}catch{}
}

function calculateIsolation(){
  try{
    currentIsolation=isolateObject(
      ui.cropPreviewCanvas,
      ui.isolatedPreviewCanvas,
      Number(ui.sensitivityRange.value)
    );

    ui.objectPixelValue.textContent=`${Math.round(currentIsolation.objectRatio*100)}%`;
    ui.isolationMethodValue.textContent=currentIsolation.method;
  }catch(error){
    currentIsolation=null;
    ui.cameraFeedback.textContent=`Isolatie mislukt: ${error.message}`;
  }
}

function previewSelection(){
  try{
    if(!selection)throw new Error("Duid eerst het cadeau aan.");

    currentCrop=cropSelection(
      ui.frozenCanvas,
      ui.selectionBox.getBoundingClientRect(),
      ui.frozenCanvas.getBoundingClientRect(),
      ui.cropPreviewCanvas
    );

    mode="isolation";
    ui.selectionLayer.classList.add("hidden");
    ui.selectControls.classList.add("hidden");
    ui.isolationControls.classList.remove("hidden");
    ui.modeTitle.textContent="Isoleer het cadeau";
    ui.modeSubtitle.textContent="Controleer wat Gift AR als object bewaart";
    ui.cameraFeedback.textContent="";

    calculateIsolation();
  }catch(error){
    ui.cameraFeedback.textContent=error.message;
  }
}

function editSelection(){
  mode="select";
  currentIsolation=null;
  ui.isolationControls.classList.add("hidden");
  ui.selectControls.classList.remove("hidden");
  ui.selectionLayer.classList.remove("hidden");
  ui.modeTitle.textContent="Duid je cadeau aan";
  ui.modeSubtitle.textContent="Pas de selectie aan";
}

function saveCurrentView(useIsolation){
  try{
    if(!currentCrop)throw new Error("Geen geldige selectie.");

    const isolationData=useIsolation && currentIsolation
      ? {
          accepted:true,
          isolatedDataUrl:currentIsolation.isolatedDataUrl,
          objectRatio:currentIsolation.objectRatio,
          method:currentIsolation.method,
          sensitivity:currentIsolation.sensitivity
        }
      : {
          accepted:false,
          method:"manual-roi"
        };

    const p=addView({
      manualCropDataUrl:currentCrop.manualCropDataUrl,
      width:currentCrop.width,
      height:currentCrop.height,
      sourceRect:currentCrop.sourceRect,
      isolation:isolationData
    });

    const limits=getLimits();
    mode="saved";
    ui.isolationControls.classList.add("hidden");
    ui.afterSaveControls.classList.remove("hidden");
    ui.viewCounterTop.textContent=`${p.views.length} / ${limits.max}`;
    ui.modeTitle.textContent="Aanzicht opgeslagen";

    if(p.views.length<limits.min){
      const remaining=limits.min-p.views.length;
      ui.modeSubtitle.textContent=`Nog minstens ${remaining} nodig`;
      ui.afterSaveMessage.textContent="Draai het cadeau naar een duidelijk andere positie.";
    }else if(p.views.length<limits.max){
      ui.modeSubtitle.textContent="Minimum bereikt";
      ui.afterSaveMessage.textContent="Je kunt afronden of extra aanzichten toevoegen.";
    }else{
      ui.modeSubtitle.textContent="Maximum bereikt";
      ui.afterSaveMessage.textContent="Vijf aanzichten opgeslagen.";
      ui.btnNextView.disabled=true;
    }
  }catch(error){
    ui.cameraFeedback.textContent=error.message;
  }
}

async function nextView(){
  await stopCamera(ui.cameraPreview);
  ui.cameraStateValue.textContent="gestopt";
  ui.cameraView.classList.remove("active","frozen");
  ui.cameraView.setAttribute("aria-hidden","true");
  ui.homeView.hidden=false;
  mode="home";
  updateHome();
  await enterRegistration();
}

async function backToGallery(){
  await leaveRegistration();
  ui.galleryCard.classList.remove("hidden");
}

function finish(){
  try{
    const p=finishProfile();
    updateHome();
    ui.galleryCard.classList.remove("hidden");
    setStatus(ui.homeStatus,`Registratie afgerond met ${p.views.length} aanzichten.`,"ok");
  }catch(error){
    setStatus(ui.homeStatus,error.message,"warn");
  }
}

function runSelfTest(){
  try{
    const caps=getCapabilities();
    const isolation=describeIsolationCapability();

    if(!modules.every(m=>m.ready))throw new Error("Niet alle modules gereed.");

    setStatus(
      ui.homeStatus,
      `Basistest geslaagd. ${modules.length} modules geladen. Secure context: ${caps.secureContext?"ja":"nee"}. Camera API: ${caps.camera?"ja":"nee"}. LocalStorage: ${caps.localStorage?"ja":"nee"}. AI-model actief: ${isolation.aiModelLoaded?"ja":"nee"}; lokale isolatie: ${isolation.localFallbackAvailable?"ja":"nee"}.`,
      "ok"
    );
  }catch(error){
    setStatus(ui.homeStatus,`Basistest mislukt: ${error.message}`,"error");
  }
}

function bindListeners(){
  if(listenersBound)return;

  ui.btnStartRegistration.addEventListener("click",enterRegistration);
  ui.btnContinueRegistration.addEventListener("click",enterRegistration);
  ui.btnShowGallery.addEventListener("click",showGallery);
  ui.btnFinishRegistration.addEventListener("click",finish);
  ui.btnSelfTest.addEventListener("click",runSelfTest);
  ui.btnBack.addEventListener("click",leaveRegistration);
  ui.btnTakePhoto.addEventListener("click",takePhoto);
  ui.btnResetSelection.addEventListener("click",resetSelection);
  ui.btnPreviewSelection.addEventListener("click",previewSelection);
  ui.btnRecalculateIsolation.addEventListener("click",calculateIsolation);
  ui.btnAcceptIsolation.addEventListener("click",()=>saveCurrentView(true));
  ui.btnKeepManualCrop.addEventListener("click",()=>saveCurrentView(false));
  ui.btnEditSelection.addEventListener("click",editSelection);
  ui.btnNextView.addEventListener("click",nextView);
  ui.btnBackToGallery.addEventListener("click",backToGallery);

  ui.selectionLayer.addEventListener("pointerdown",pointerDown);
  ui.selectionLayer.addEventListener("pointermove",pointerMove);
  ui.selectionLayer.addEventListener("pointerup",pointerUp);
  ui.selectionLayer.addEventListener("pointercancel",pointerUp);

  document.addEventListener("visibilitychange",()=>{
    if(document.hidden&&mode!=="home")leaveRegistration();
  });

  window.addEventListener("pagehide",()=>{
    if(mode!=="home")stopCamera(ui.cameraPreview);
  });

  listenersBound=true;
}

function init(){
  ui=getUI();
  ui.versionValue.textContent=VERSION;
  ui.baselineValue.textContent=BASELINE;
  bindListeners();
  updateHome();
  setStatus(ui.homeStatus,`Gift AR v${VERSION} is correct gestart.`,"ok");
}

window.addEventListener("DOMContentLoaded",init,{once:true});
