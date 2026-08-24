const STORAGE_KEY="gift-ar-v0.5.0-registration";

export const registrationModule=Object.freeze({name:"Registration Core 2.0",ready:true});

export function saveRegistration(data){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}
export function loadRegistration(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    return raw?JSON.parse(raw):null;
  }catch{return null}
}
export function clearRegistration(){
  localStorage.removeItem(STORAGE_KEY);
}

export function visibleVideoRect(video){
  const vw=video.videoWidth,vh=video.videoHeight;
  const rect=video.getBoundingClientRect();
  if(!vw||!vh||!rect.width||!rect.height)throw new Error("Camera-afmetingen niet beschikbaar.");
  const scale=Math.max(rect.width/vw,rect.height/vh);
  const renderedWidth=vw*scale;
  const renderedHeight=vh*scale;
  return {
    videoWidth:vw,videoHeight:vh,rect,scale,
    offsetX:(rect.width-renderedWidth)/2,
    offsetY:(rect.height-renderedHeight)/2
  };
}

export function freezeVisibleFrame(video,canvas){
  const m=visibleVideoRect(video);
  const cssW=Math.round(m.rect.width);
  const cssH=Math.round(m.rect.height);

  const sx=(0-m.offsetX)/m.scale;
  const sy=(0-m.offsetY)/m.scale;
  const sw=cssW/m.scale;
  const sh=cssH/m.scale;

  canvas.width=Math.max(1,Math.round(sw));
  canvas.height=Math.max(1,Math.round(sh));
  const ctx=canvas.getContext("2d");
  ctx.drawImage(video,sx,sy,sw,sh,0,0,canvas.width,canvas.height);

  return {width:canvas.width,height:canvas.height};
}

export function cropSelection(frozenCanvas, selectionRect, displayRect, previewCanvas){
  const sxScale=frozenCanvas.width/displayRect.width;
  const syScale=frozenCanvas.height/displayRect.height;

  const sx=Math.max(0,(selectionRect.left-displayRect.left)*sxScale);
  const sy=Math.max(0,(selectionRect.top-displayRect.top)*syScale);
  const sw=Math.min(frozenCanvas.width-sx,selectionRect.width*sxScale);
  const sh=Math.min(frozenCanvas.height-sy,selectionRect.height*syScale);

  if(sw<10||sh<10)throw new Error("Selectie is te klein.");

  const maxW=640;
  const factor=Math.min(1,maxW/sw);
  previewCanvas.width=Math.max(1,Math.round(sw*factor));
  previewCanvas.height=Math.max(1,Math.round(sh*factor));

  const ctx=previewCanvas.getContext("2d");
  ctx.clearRect(0,0,previewCanvas.width,previewCanvas.height);
  ctx.drawImage(frozenCanvas,sx,sy,sw,sh,0,0,previewCanvas.width,previewCanvas.height);

  return {
    source:{x:sx,y:sy,width:sw,height:sh},
    dataUrl:previewCanvas.toDataURL("image/jpeg",0.88),
    width:Math.round(sw),
    height:Math.round(sh)
  };
}
