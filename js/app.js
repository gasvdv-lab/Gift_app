import{cameraModule,startCamera,stopCamera}from"./camera.js";
import{registrationModule,saveRegistration,loadRegistration,clearRegistration,freezeVisibleFrame,cropSelection}from"./registration.js";
import{getUI,setStatus}from"./ui.js";
import{getCapabilities}from"./capabilities.js";

const VERSION="0.5.0";
const BASELINE="0.2.0";
const modules=[cameraModule,registrationModule];

let ui;
let mode="home";
let drag=null;
let selection=null;
let currentCrop=null;
let listenersBound=false;

function updateSavedState(){
  const saved=loadRegistration();
  ui.registrationStateValue.textContent=saved?"1 aanzicht opgeslagen":"geen";
  ui.btnShowSaved.disabled=!saved;
  if(saved){
    ui.savedImage.src=saved.dataUrl;
    ui.savedSizeValue.textContent=`${saved.width} × ${saved.height}px`;
    ui.savedDateValue.textContent=new Date(saved.savedAt).toLocaleString();
  }
}

function showSaved(){
  const saved=loadRegistration();
  if(!saved)return;
  ui.savedCard.classList.toggle("hidden");
}

async function enterRegistration(){
  try{
    mode="camera";
    selection=null;
    currentCrop=null;
    ui.cameraView.classList.remove("frozen");
    ui.homeView.hidden=true;
    ui.cameraView.classList.add("active");
    ui.cameraView.setAttribute("aria-hidden","false");
    ui.captureControls.classList.remove("hidden");
    ui.selectControls.classList.add("hidden");
    ui.confirmControls.classList.add("hidden");
    ui.selectionLayer.classList.add("hidden");
    ui.selectionBox.classList.add("hidden");
    ui.modeTitle.textContent="Neem een foto";
    ui.modeSubtitle.textContent="Zorg dat het cadeau duidelijk zichtbaar is";
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
  ui.cameraStateValue.textContent="gestopt";
  ui.cameraView.classList.remove("active","frozen");
  ui.cameraView.setAttribute("aria-hidden","true");
  ui.homeView.hidden=false;
  updateSavedState();
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
    ui.modeSubtitle.textContent="Sleep een kader rond het object";
    ui.cameraFeedback.textContent="Trek met je vinger een rechthoek rond het cadeau.";
  }catch(error){
    ui.cameraFeedback.textContent=error.message;
  }
}

function resetSelection(){
  selection=null;
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
  const layer=ui.selectionLayer.getBoundingClientRect();

  if(handle&&selection){
    drag={type:"resize",handle,startX:e.clientX,startY:e.clientY,initial:{...selection}};
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
    ui.cameraFeedback.textContent="Selectie gemaakt. Pas eventueel de hoekpunten aan.";
  }else{
    resetSelection();
    ui.cameraFeedback.textContent="Selectie te klein. Probeer opnieuw.";
  }
  try{ui.selectionLayer.releasePointerCapture?.(e.pointerId)}catch{}
}

function previewSelection(){
  try{
    if(!selection)throw new Error("Duid eerst het cadeau aan.");
    const displayRect=ui.frozenCanvas.getBoundingClientRect();
    const selectionRect=ui.selectionBox.getBoundingClientRect();
    currentCrop=cropSelection(ui.frozenCanvas,selectionRect,displayRect,ui.cropPreviewCanvas);

    mode="confirm";
    ui.selectionLayer.classList.add("hidden");
    ui.selectControls.classList.add("hidden");
    ui.confirmControls.classList.remove("hidden");
    ui.modeTitle.textContent="Controleer selectie";
    ui.modeSubtitle.textContent="Dit is wat Gift AR zal onthouden";
    ui.cameraFeedback.textContent="";
  }catch(error){
    ui.cameraFeedback.textContent=error.message;
  }
}

function editSelection(){
  mode="select";
  ui.selectionLayer.classList.remove("hidden");
  ui.selectControls.classList.remove("hidden");
  ui.confirmControls.classList.add("hidden");
  ui.modeTitle.textContent="Duid je cadeau aan";
  ui.modeSubtitle.textContent="Pas de selectie aan";
}

async function confirmSelection(){
  try{
    if(!currentCrop)throw new Error("Geen geldige selectie.");
    saveRegistration({
      version:1,
      dataUrl:currentCrop.dataUrl,
      width:currentCrop.width,
      height:currentCrop.height,
      sourceRect:currentCrop.source,
      savedAt:new Date().toISOString()
    });
    setStatus(ui.homeStatus,"Aanzicht succesvol opgeslagen.","ok");
    await leaveRegistration();
    ui.savedCard.classList.remove("hidden");
    updateSavedState();
  }catch(error){
    ui.cameraFeedback.textContent=error.message;
  }
}

function runSelfTest(){
  try{
    const caps=getCapabilities();
    if(!modules.every(m=>m.ready))throw new Error("Niet alle modules gereed.");
    setStatus(
      ui.homeStatus,
      `Basistest geslaagd. Secure context: ${caps.secureContext?"ja":"nee"}. Camera API: ${caps.camera?"ja":"nee"}. LocalStorage: ${caps.localStorage?"ja":"nee"}.`,
      "ok"
    );
  }catch(error){
    setStatus(ui.homeStatus,`Basistest mislukt: ${error.message}`,"error");
  }
}

function bindListeners(){
  if(listenersBound)return;
  ui.btnStartRegistration.addEventListener("click",enterRegistration);
  ui.btnShowSaved.addEventListener("click",showSaved);
  ui.btnDeleteSaved.addEventListener("click",()=>{
    clearRegistration();
    ui.savedCard.classList.add("hidden");
    updateSavedState();
    setStatus(ui.homeStatus,"Opgeslagen aanzicht verwijderd.","ok");
  });
  ui.btnSelfTest.addEventListener("click",runSelfTest);
  ui.btnBack.addEventListener("click",leaveRegistration);
  ui.btnTakePhoto.addEventListener("click",takePhoto);
  ui.btnResetSelection.addEventListener("click",resetSelection);
  ui.btnPreviewSelection.addEventListener("click",previewSelection);
  ui.btnEditSelection.addEventListener("click",editSelection);
  ui.btnConfirmSelection.addEventListener("click",confirmSelection);

  ui.selectionLayer.addEventListener("pointerdown",pointerDown);
  ui.selectionLayer.addEventListener("pointermove",pointerMove);
  ui.selectionLayer.addEventListener("pointerup",pointerUp);
  ui.selectionLayer.addEventListener("pointercancel",pointerUp);

  document.addEventListener("visibilitychange",()=>{
    if(document.hidden&&mode!=="home")leaveRegistration();
  });

  window.addEventListener("pagehide",()=>{
    if(mode!=="home")leaveRegistration();
  });

  listenersBound=true;
}

function init(){
  ui=getUI();
  ui.versionValue.textContent=VERSION;
  ui.baselineValue.textContent=BASELINE;
  bindListeners();
  updateSavedState();
  setStatus(ui.homeStatus,`Gift AR v${VERSION} is correct gestart.`,"ok");
}

window.addEventListener("DOMContentLoaded",init,{once:true});
