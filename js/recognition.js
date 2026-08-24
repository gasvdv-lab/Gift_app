const KEY="gift-ar-v0.3.0-recognition",MAX=3,S=24,TH=0.86;let timer=null;
export const recognitionModule=Object.freeze({name:"Recognition Engine",ready:true});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createDescriptor(video,canvas){const w=video.videoWidth,h=video.videoHeight;if(!w||!h)throw new Error("Nog geen camerabeeld.");const size=Math.min(w,h)*.68,sx=(w-size)/2,sy=(h-size)/2,ctx=canvas.getContext("2d",{willReadFrequently:true});canvas.width=S;canvas.height=S;ctx.drawImage(video,sx,sy,size,size,0,0,S,S);const d=ctx.getImageData(0,0,S,S).data,g=[],hist=new Array(24).fill(0);let sum=0,sum2=0;for(let i=0;i<d.length;i+=4){const r=d[i],gg=d[i+1],b=d[i+2],y=.299*r+.587*gg+.114*b;g.push(y);sum+=y;sum2+=y*y;hist[Math.min(7,Math.floor(r/32))]++;hist[8+Math.min(7,Math.floor(gg/32))]++;hist[16+Math.min(7,Math.floor(b/32))]++}const n=g.length,mean=sum/n,std=Math.sqrt(Math.max(1,sum2/n-mean*mean));return{gray:g.map(v=>clamp((v-mean)/std,-3,3)),hist:hist.map(v=>v/n)}}
function cos(a,b){let d=0,aa=0,bb=0;for(let i=0;i<a.length;i++){d+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i]}return aa&&bb?d/Math.sqrt(aa*bb):0}
function hs(a,b){let diff=0;for(let i=0;i<a.length;i++)diff+=Math.abs(a[i]-b[i]);return clamp(1-diff/6,0,1)}
function cmp(a,b){return .78*clamp((cos(a.gray,b.gray)+1)/2,0,1)+.22*hs(a.hist,b.hist)}
export function getReferences(){try{const p=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(p)?p.slice(0,MAX):[]}catch{return[]}}
export function saveReference(d){const r=getReferences();if(r.length>=MAX)throw new Error("Drie aanzichten zijn al geregistreerd.");r.push(d);localStorage.setItem(KEY,JSON.stringify(r));return r.length}
export function clearReferences(){localStorage.removeItem(KEY)}
export const getMaxReferences=()=>MAX;export const getThreshold=()=>TH;
export function stopRecognitionLoop(){if(timer!==null){clearInterval(timer);timer=null}}
export function startRecognitionLoop({video,canvas,onResult,intervalMs=650}){stopRecognitionLoop();const refs=getReferences();if(!refs.length)throw new Error("Registreer eerst een aanzicht.");const run=()=>{try{const cur=createDescriptor(video,canvas);let best=0;for(const r of refs)best=Math.max(best,cmp(cur,r));onResult({similarity:best,matched:best>=TH})}catch(error){onResult({error})}};run();timer=setInterval(run,intervalMs)}