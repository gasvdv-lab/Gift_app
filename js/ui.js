export function getUI(){
  const ids=[
    "homeView","cameraView","homeStatus","btnStartRegistration","btnShowGallery","galleryCard",
    "galleryGrid","galleryCountValue","btnContinueRegistration","btnFinishRegistration","versionValue",
    "baselineValue","referenceCountHome","registrationStateValue","cameraStateValue","moduleCountValue",
    "btnSelfTest","cameraPreview","frozenCanvas","btnBack","modeTitle","modeSubtitle","viewCounterTop",
    "selectionLayer","selectionBox","cameraFeedback","captureControls","selectControls","isolationControls",
    "afterSaveControls","btnTakePhoto","btnResetSelection","btnPreviewSelection","cropPreviewCanvas",
    "isolatedPreviewCanvas","objectPixelValue","isolationMethodValue","sensitivityRange",
    "btnRecalculateIsolation","btnAcceptIsolation","btnKeepManualCrop","btnEditSelection",
    "afterSaveMessage","btnBackToGallery","btnNextView"
  ];

  const ui={};
  for(const id of ids){
    const el=document.getElementById(id);
    if(!el)throw new Error(`Ontbrekend DOM-element: #${id}`);
    ui[id]=el;
  }
  return ui;
}

export function setStatus(el,message,kind=""){
  el.textContent=message;
  el.className=`status ${kind}`.trim();
}
