export function getUI(){
  const ids=[
    "homeView","cameraView","homeStatus","btnEnterRegister","btnEnterRecognize","btnBack",
    "cameraPreview","analysisCanvas","cameraStatus","recognitionFeedback","scanBox",
    "modeTitle","modeSubtitle","registerControls","recognizeControls","btnCaptureReference",
    "btnToggleRecognition","referenceCountCamera","referenceCountHome","versionValue",
    "baselineValue","cameraStateValue","btnSelfTest","btnClearReferencesHome",
    "featureCountValue","coverageValue","qualityValue","liveFeatureCountValue",
    "goodMatchesValue","inliersValue","confidenceValue"
  ];
  const ui={};
  for(const id of ids){
    const el=document.getElementById(id);
    if(!el)throw new Error(`Ontbrekend DOM-element: #${id}`);
    ui[id]=el;
  }
  return ui;
}
export function setHomeStatus(el,message,kind=""){
  el.textContent=message;
  el.className=`status ${kind}`.trim();
}
