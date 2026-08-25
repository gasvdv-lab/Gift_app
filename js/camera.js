let activeStream=null;
export const cameraModule=Object.freeze({name:"Camera/Input",ready:true});
export async function startCamera(video){
  await stopCamera(video);
  if(!navigator.mediaDevices?.getUserMedia)throw new Error("Camera-API niet ondersteund.");
  activeStream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"}}});
  video.srcObject=activeStream;
  await video.play();
}
export async function stopCamera(video){
  const stream=activeStream||video?.srcObject;
  if(stream)for(const track of stream.getTracks())track.stop();
  if(video){video.pause();video.srcObject=null}
  activeStream=null;
}
