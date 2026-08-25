const STORAGE_KEY="gift-ar-v0.6.0-registration-profile";
const MIN_VIEWS=3;
const MAX_VIEWS=5;

export const registrationModule=Object.freeze({name:"Registration Core 2.0",ready:true});

function emptyProfile(){
  return {version:3,minViews:MIN_VIEWS,maxViews:MAX_VIEWS,status:"in_progress",views:[]};
}

export function loadProfile(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return emptyProfile();
    const parsed=JSON.parse(raw);
    if(!parsed||!Array.isArray(parsed.views))return emptyProfile();
    parsed.minViews=MIN_VIEWS;
    parsed.maxViews=MAX_VIEWS;
    return parsed;
  }catch{return emptyProfile()}
}

export function saveProfile(profile){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(profile));
}

export function addView(view){
  const profile=loadProfile();
  if(profile.views.length>=MAX_VIEWS)throw new Error("Maximum van 5 aanzichten bereikt.");

  profile.views.push({
    id:`view-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    order:profile.views.length+1,
    ...view,
    savedAt:new Date().toISOString()
  });

  profile.status=profile.views.length>=MIN_VIEWS?"ready_to_finish":"in_progress";
  saveProfile(profile);
  return profile;
}

export function removeView(id){
  const profile=loadProfile();
  profile.views=profile.views.filter(v=>v.id!==id);
  profile.views.forEach((v,i)=>v.order=i+1);
  profile.status=profile.views.length>=MIN_VIEWS?"ready_to_finish":"in_progress";
  saveProfile(profile);
  return profile;
}

export function finishProfile(){
  const profile=loadProfile();
  if(profile.views.length<MIN_VIEWS)throw new Error(`Registreer minstens ${MIN_VIEWS} aanzichten.`);
  profile.status="completed";
  profile.completedAt=new Date().toISOString();
  saveProfile(profile);
  return profile;
}

export function getLimits(){return{min:MIN_VIEWS,max:MAX_VIEWS}}

export function freezeVisibleFrame(video,canvas){
  const vw=video.videoWidth,vh=video.videoHeight;
  const rect=video.getBoundingClientRect();
  if(!vw||!vh||!rect.width||!rect.height)throw new Error("Camera-afmetingen niet beschikbaar.");

  const scale=Math.max(rect.width/vw,rect.height/vh);
  const rw=vw*scale,rh=vh*scale;
  const ox=(rect.width-rw)/2,oy=(rect.height-rh)/2;
  const sx=-ox/scale,sy=-oy/scale,sw=rect.width/scale,sh=rect.height/scale;

  canvas.width=Math.max(1,Math.round(sw));
  canvas.height=Math.max(1,Math.round(sh));
  canvas.getContext("2d").drawImage(video,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
}

export function cropSelection(frozenCanvas,selectionRect,displayRect,previewCanvas){
  const xs=frozenCanvas.width/displayRect.width;
  const ys=frozenCanvas.height/displayRect.height;
  const sx=Math.max(0,(selectionRect.left-displayRect.left)*xs);
  const sy=Math.max(0,(selectionRect.top-displayRect.top)*ys);
  const sw=Math.min(frozenCanvas.width-sx,selectionRect.width*xs);
  const sh=Math.min(frozenCanvas.height-sy,selectionRect.height*ys);
  if(sw<10||sh<10)throw new Error("Selectie is te klein.");

  const maxW=640;
  const factor=Math.min(1,maxW/sw);
  previewCanvas.width=Math.max(1,Math.round(sw*factor));
  previewCanvas.height=Math.max(1,Math.round(sh*factor));
  previewCanvas.getContext("2d").drawImage(frozenCanvas,sx,sy,sw,sh,0,0,previewCanvas.width,previewCanvas.height);

  return {
    sourceRect:{x:sx,y:sy,width:sw,height:sh},
    manualCropDataUrl:previewCanvas.toDataURL("image/jpeg",0.9),
    width:Math.round(sw),
    height:Math.round(sh)
  };
}
