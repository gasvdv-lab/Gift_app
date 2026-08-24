export function getUI(){
  const ids=[
    "homeView","cameraView","homeStatus","btnStartRegistration","btnShowSaved","savedCard",
    "savedImage","savedSizeValue","savedDateValue","btnDeleteSaved","versionValue","baselineValue",
    "cameraStateValue","registrationStateValue","btnSelfTest","cameraPreview","frozenCanvas",
    "btnBack","modeTitle","modeSubtitle","selectionLayer","selectionBox","cameraFeedback",
    "captureControls","selectControls","confirmControls","btnTakePhoto","btnResetSelection",
    "btnPreviewSelection","cropPreviewCanvas","btnEditSelection","btnConfirmSelection"
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
