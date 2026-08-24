const KEY="gift-ar-v0.3.2-recognition";
const MAX=3,S=32,TH=0.74,SAMPLES=7,SAMPLE_DELAY=120;
let timer=null;

export const recognitionModule=Object.freeze({name:"Recognition Engine",ready:true});

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function crop(video){
  const w=video.videoWidth,h=video.videoHeight;
  if(!w||!h)throw new Error("Nog geen camerabeeld.");
  const size=Math.min(w,h)*.68;
  return {sx:(w-size)/2,sy:(h-size)/2,size};
}

function normalize(arr){
  let sum=0,sum2=0;
  for(const v of arr){sum+=v;sum2+=v*v}
  const n=arr.length,mean=sum/n,std=Math.sqrt(Math.max(1,sum2/n-mean*mean));
  return arr.map(v=>clamp((v-mean)/std,-3,3));
}

function edgeMap(gray){
  const out=[];
  for(let y=1;y<S-1;y++){
    for(let x=1;x<S-1;x++){
      const i=y*S+x;
      const gx=(gray[i+1]-gray[i-1])*0.5;
      const gy=(gray[i+S]-gray[i-S])*0.5;
      out.push(Math.sqrt(gx*gx+gy*gy));
    }
  }
  return normalize(out);
}

function localContrast(gray){
  const out=[];
  for(let y=1;y<S-1;y++){
    for(let x=1;x<S-1;x++){
      const i=y*S+x;
      let sum=0;
      for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++)sum+=gray[i+yy*S+xx];
      out.push(gray[i]-sum/9);
    }
  }
  return normalize(out);
}

export function createDescriptor(video,canvas){
  const ctx=canvas.getContext("2d",{willReadFrequently:true});
  if(!ctx)throw new Error("Canvas-context niet beschikbaar.");
  canvas.width=S;canvas.height=S;
  const {sx,sy,size}=crop(video);
  ctx.drawImage(video,sx,sy,size,size,0,0,S,S);
  const d=ctx.getImageData(0,0,S,S).data;
  const gray=[],satHist=new Array(8).fill(0);
  for(let i=0;i<d.length;i+=4){
    const r=d[i],g=d[i+1],b=d[i+2];
    gray.push(.299*r+.587*g+.114*b);
    const max=Math.max(r,g,b),min=Math.min(r,g,b);
    const sat=max===0?0:(max-min)/max;
    satHist[Math.min(7,Math.floor(sat*8))]++;
  }
  const n=gray.length;
  return {
    edge: edgeMap(gray),
    local: localContrast(gray),
    sat: satHist.map(v=>v/n)
  };
}

function cos(a,b){
  let d=0,aa=0,bb=0;
  for(let i=0;i<a.length;i++){d+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i]}
  return aa&&bb?d/Math.sqrt(aa*bb):0;
}
function histSim(a,b){
  let diff=0;
  for(let i=0;i<a.length;i++)diff+=Math.abs(a[i]-b[i]);
  return clamp(1-diff/2,0,1);
}
function sim(a,b){
  const edge=clamp((cos(a.edge,b.edge)+1)/2,0,1);
  const local=clamp((cos(a.local,b.local)+1)/2,0,1);
  const sat=histSim(a.sat,b.sat);
  return .55*edge+.40*local+.05*sat;
}

function averageDescriptors(list){
  if(!list.length)throw new Error("Geen samples beschikbaar.");
  const avg=(key)=>list[0][key].map((_,i)=>list.reduce((s,d)=>s+d[key][i],0)/list.length);
  return {edge:avg("edge"),local:avg("local"),sat:avg("sat")};
}

export async function captureStableReference(video,canvas,onProgress){
  const samples=[];
  for(let i=0;i<SAMPLES;i++){
    samples.push(createDescriptor(video,canvas));
    if(onProgress)onProgress(i+1,SAMPLES);
    if(i<SAMPLES-1)await sleep(SAMPLE_DELAY);
  }
  return averageDescriptors(samples);
}

export function getReferences(){
  try{
    const p=JSON.parse(localStorage.getItem(KEY)||"[]");
    return Array.isArray(p)?p.slice(0,MAX):[];
  }catch{return[]}
}
export function saveReference(d){
  const r=getReferences();
  if(r.length>=MAX)throw new Error("Drie aanzichten zijn al geregistreerd.");
  r.push(d);localStorage.setItem(KEY,JSON.stringify(r));return r.length
}
export function clearReferences(){localStorage.removeItem(KEY)}
export const getMaxReferences=()=>MAX;
export const getThreshold=()=>TH;
export function stopRecognitionLoop(){if(timer!==null){clearInterval(timer);timer=null}}

export function startRecognitionLoop({video,canvas,onResult,intervalMs=650}){
  stopRecognitionLoop();
  const refs=getReferences();
  if(!refs.length)throw new Error("Registreer eerst een aanzicht.");
  const run=()=>{
    try{
      const cur=createDescriptor(video,canvas);
      let best=0;
      for(const r of refs)best=Math.max(best,sim(cur,r));
      onResult({similarity:best,matched:best>=TH});
    }catch(error){onResult({error})}
  };
  run();
  timer=setInterval(run,intervalMs);
}