let activeStream=null;
export const cameraModule=Object.freeze({name:"Camera/Input",ready:true});
export async function startCamera(video){await stopCamera(video);if(!navigator.mediaDevices?.getUserMedia)throw new Error("Camera-API niet ondersteund.");activeStream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"}}});video.srcObject=activeStream;await video.play();return activeStream}
export async function stopCamera(video){const s=activeStream||video?.srcObject;if(s)for(const t of s.getTracks())t.stop();if(video){video.pause();video.srcObject=null}activeStream=null}
export function isCameraRunning(){return !!(activeStream&&activeStream.getVideoTracks().some(t=>t.readyState==="live"))}