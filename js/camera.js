let activeStream=null;
export const cameraModule=Object.freeze({name:"Camera/Input",ready:true});
export async function startCamera(videoElement){
  if(!navigator.mediaDevices?.getUserMedia) throw new Error("Camera-API wordt niet ondersteund op dit toestel.");
  await stopCamera(videoElement);
  const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"}}});
  activeStream=stream; videoElement.srcObject=stream;
  try{await videoElement.play();}catch(error){await stopCamera(videoElement);throw error;}
  return stream;
}
export async function stopCamera(videoElement){
  const stream=activeStream||videoElement?.srcObject;
  if(stream){for(const track of stream.getTracks()) track.stop();}
  if(videoElement){videoElement.pause();videoElement.srcObject=null;}
  activeStream=null;
}
export function isCameraRunning(){return Boolean(activeStream&&activeStream.getVideoTracks().some(t=>t.readyState==="live"));}
