const STORAGE_KEY="gift-ar-v0.4.1-feature-recognition";
const MAX_REFERENCES=3;
const SIZE=96;
const MAX_FEATURES=90;
const DESCRIPTOR_BITS=96;
const MIN_FEATURES_TO_SAVE=18;
const MATCH_DISTANCE_MAX=28;
const RATIO_LIMIT=0.78;
const INLIER_ERROR=0.075;
let recognitionTimer=null;

export const recognitionModule=Object.freeze({name:"Recognition Engine 2",ready:true});

function seededPairs(){
  let seed=1337;
  const rand=()=>{
    seed=(seed*1664525+1013904223)>>>0;
    return seed/4294967296;
  };
  const pairs=[];
  for(let i=0;i<DESCRIPTOR_BITS;i++){
    const p=()=>({x:Math.round((rand()*2-1)*7),y:Math.round((rand()*2-1)*7)});
    pairs.push([p(),p()]);
  }
  return pairs;
}
const BRIEF_PAIRS=seededPairs();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function getObjectFitCoverMapping(video){
  const vw=video.videoWidth,vh=video.videoHeight;
  const rect=video.getBoundingClientRect();
  if(!vw||!vh||!rect.width||!rect.height)throw new Error("Camera-afmetingen nog niet beschikbaar.");

  const scale=Math.max(rect.width/vw,rect.height/vh);
  const renderedWidth=vw*scale;
  const renderedHeight=vh*scale;
  const offsetX=(rect.width-renderedWidth)/2;
  const offsetY=(rect.height-renderedHeight)/2;

  return {vw,vh,rect,scale,renderedWidth,renderedHeight,offsetX,offsetY};
}

export function scanBoxToVideoCrop(video,scanBox){
  const map=getObjectFitCoverMapping(video);
  const box=scanBox.getBoundingClientRect();

  const leftInVideoElement=box.left-map.rect.left;
  const topInVideoElement=box.top-map.rect.top;
  const rightInVideoElement=box.right-map.rect.left;
  const bottomInVideoElement=box.bottom-map.rect.top;

  let sx=(leftInVideoElement-map.offsetX)/map.scale;
  let sy=(topInVideoElement-map.offsetY)/map.scale;
  let ex=(rightInVideoElement-map.offsetX)/map.scale;
  let ey=(bottomInVideoElement-map.offsetY)/map.scale;

  sx=clamp(sx,0,map.vw);
  sy=clamp(sy,0,map.vh);
  ex=clamp(ex,0,map.vw);
  ey=clamp(ey,0,map.vh);

  const sw=Math.max(1,ex-sx);
  const sh=Math.max(1,ey-sy);

  return {sx,sy,sw,sh};
}

function captureGray(video,scanBox,canvas,debugCanvas){
  const {sx,sy,sw,sh}=scanBoxToVideoCrop(video,scanBox);
  const ctx=canvas.getContext("2d",{willReadFrequently:true});
  if(!ctx)throw new Error("Canvas-context niet beschikbaar.");

  canvas.width=SIZE;canvas.height=SIZE;
  ctx.drawImage(video,sx,sy,sw,sh,0,0,SIZE,SIZE);

  if(debugCanvas){
    const dctx=debugCanvas.getContext("2d");
    if(dctx){
      debugCanvas.width=192;
      debugCanvas.height=192;
      dctx.clearRect(0,0,192,192);
      dctx.drawImage(video,sx,sy,sw,sh,0,0,192,192);
    }
  }

  const rgba=ctx.getImageData(0,0,SIZE,SIZE).data;
  const gray=new Float32Array(SIZE*SIZE);
  let sum=0,sumSq=0;
  for(let i=0,p=0;i<rgba.length;i+=4,p++){
    const y=.299*rgba[i]+.587*rgba[i+1]+.114*rgba[i+2];
    gray[p]=y;sum+=y;sumSq+=y*y;
  }
  const n=gray.length,mean=sum/n,std=Math.sqrt(Math.max(25,sumSq/n-mean*mean));
  for(let i=0;i<n;i++)gray[i]=clamp((gray[i]-mean)/std,-3,3);
  return gray;
}

function cornerCandidates(gray){
  const candidates=[];
  for(let y=3;y<SIZE-3;y++){
    for(let x=3;x<SIZE-3;x++){
      let sxx=0,syy=0,sxy=0;
      for(let wy=-1;wy<=1;wy++){
        for(let wx=-1;wx<=1;wx++){
          const i=(y+wy)*SIZE+(x+wx);
          const gx=(gray[i+1]-gray[i-1])*.5;
          const gy=(gray[i+SIZE]-gray[i-SIZE])*.5;
          sxx+=gx*gx;syy+=gy*gy;sxy+=gx*gy;
        }
      }
      const det=sxx*syy-sxy*sxy;
      const trace=sxx+syy;
      const score=det-.045*trace*trace;
      if(score>.25)candidates.push({x,y,score});
    }
  }
  candidates.sort((a,b)=>b.score-a.score);
  const selected=[];
  for(const c of candidates){
    let near=false;
    for(const s of selected){
      const dx=c.x-s.x,dy=c.y-s.y;
      if(dx*dx+dy*dy<36){near=true;break}
    }
    if(!near){
      selected.push(c);
      if(selected.length>=MAX_FEATURES)break;
    }
  }
  return selected;
}

function briefDescriptor(gray,x,y){
  return BRIEF_PAIRS.map(([a,b])=>{
    const ax=clamp(x+a.x,0,SIZE-1),ay=clamp(y+a.y,0,SIZE-1);
    const bx=clamp(x+b.x,0,SIZE-1),by=clamp(y+b.y,0,SIZE-1);
    return gray[ay*SIZE+ax]<gray[by*SIZE+bx]?1:0;
  });
}

function coverage(features){
  if(!features.length)return 0;
  const cells=new Set();
  for(const f of features){
    const cx=Math.min(3,Math.floor(f.x*4));
    const cy=Math.min(3,Math.floor(f.y*4));
    cells.add(`${cx}:${cy}`);
  }
  return cells.size/16;
}

export function extractFeatures(video,scanBox,canvas,debugCanvas){
  const gray=captureGray(video,scanBox,canvas,debugCanvas);
  const corners=cornerCandidates(gray);
  const features=corners.map(c=>({
    x:c.x/(SIZE-1),
    y:c.y/(SIZE-1),
    score:c.score,
    descriptor:briefDescriptor(gray,c.x,c.y)
  }));
  return {features,coverage:coverage(features)};
}

function hamming(a,b){
  let d=0;
  for(let i=0;i<a.length;i++)if(a[i]!==b[i])d++;
  return d;
}

function matchFeatures(current,reference){
  const matches=[];
  for(const c of current){
    let bestD=Infinity,bestRef=null,second=Infinity;
    for(const r of reference){
      const d=hamming(c.descriptor,r.descriptor);
      if(d<bestD){second=bestD;bestD=d;bestRef=r}
      else if(d<second)second=d;
    }
    if(bestRef&&bestD<=MATCH_DISTANCE_MAX&&bestD<second*RATIO_LIMIT){
      matches.push({current:c,reference:bestRef,distance:bestD});
    }
  }

  matches.sort((a,b)=>a.distance-b.distance);
  const used=new Set();
  return matches.filter(m=>{
    const k=`${m.reference.x.toFixed(4)}:${m.reference.y.toFixed(4)}`;
    if(used.has(k))return false;
    used.add(k);
    return true;
  });
}

function estimateSimilarity(m1,m2){
  const r1=m1.reference,r2=m2.reference,c1=m1.current,c2=m2.current;
  const rdx=r2.x-r1.x,rdy=r2.y-r1.y;
  const cdx=c2.x-c1.x,cdy=c2.y-c1.y;
  const rlen=Math.hypot(rdx,rdy),clen=Math.hypot(cdx,cdy);
  if(rlen<.05||clen<.03)return null;
  const scale=clen/rlen;
  if(scale<.45||scale>2.2)return null;
  const angle=Math.atan2(cdy,cdx)-Math.atan2(rdy,rdx);
  const cos=Math.cos(angle),sin=Math.sin(angle);
  return {
    scale,cos,sin,
    tx:c1.x-scale*(cos*r1.x-sin*r1.y),
    ty:c1.y-scale*(sin*r1.x+cos*r1.y)
  };
}

function transform(p,t){
  return {
    x:t.tx+t.scale*(t.cos*p.x-t.sin*p.y),
    y:t.ty+t.scale*(t.sin*p.x+t.cos*p.y)
  };
}

function verify(matches){
  if(matches.length<2)return {inliers:0};
  let best=0;
  const limit=Math.min(matches.length,28);
  for(let i=0;i<limit;i++){
    for(let j=i+1;j<limit;j++){
      const model=estimateSimilarity(matches[i],matches[j]);
      if(!model)continue;
      let n=0;
      for(const m of matches){
        const p=transform(m.reference,model);
        if(Math.hypot(p.x-m.current.x,p.y-m.current.y)<=INLIER_ERROR)n++;
      }
      if(n>best)best=n;
    }
  }
  return {inliers:best};
}

function confidence(inliers,good){
  if(inliers>=12&&good>=14)return "HOOG";
  if(inliers>=8&&good>=10)return "MIDDEL";
  if(inliers>=5&&good>=7)return "LAAG";
  return "GEEN";
}

export function evaluate(liveFeatures,refs){
  let best={goodMatches:0,inliers:0,confidence:"GEEN"};
  for(const ref of refs){
    const matches=matchFeatures(liveFeatures,ref.features);
    const geo=verify(matches);
    const c=confidence(geo.inliers,matches.length);
    if(geo.inliers>best.inliers||(geo.inliers===best.inliers&&matches.length>best.goodMatches)){
      best={goodMatches:matches.length,inliers:geo.inliers,confidence:c};
    }
  }
  return best;
}

export function getReferences(){
  try{
    const p=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
    return Array.isArray(p)?p.slice(0,MAX_REFERENCES):[];
  }catch{return[]}
}

export function saveReference(profile){
  if(profile.features.length<MIN_FEATURES_TO_SAVE){
    throw new Error(`Te weinig bruikbare kenmerken (${profile.features.length}). Probeer dichterbij, beter licht of voeg een opvallend detail toe.`);
  }
  const refs=getReferences();
  if(refs.length>=MAX_REFERENCES)throw new Error("Drie aanzichten zijn al geregistreerd.");
  refs.push(profile);
  localStorage.setItem(STORAGE_KEY,JSON.stringify(refs));
  return refs.length;
}

export function clearReferences(){localStorage.removeItem(STORAGE_KEY)}
export function getMaxReferences(){return MAX_REFERENCES}

export function qualityLabel(featureCount,coverageValue){
  if(featureCount>=50&&coverageValue>=.45)return "GOED";
  if(featureCount>=28&&coverageValue>=.28)return "MATIG";
  return "MOEILIJK";
}

export function stopRecognitionLoop(){
  if(recognitionTimer!==null){
    clearInterval(recognitionTimer);
    recognitionTimer=null;
  }
}

export function startRecognitionLoop({video,scanBox,canvas,debugCanvas,onResult,intervalMs=750}){
  stopRecognitionLoop();
  const refs=getReferences();
  if(!refs.length)throw new Error("Registreer eerst minstens één aanzicht.");

  const run=()=>{
    try{
      const live=extractFeatures(video,scanBox,canvas,debugCanvas);
      const result=evaluate(live.features,refs);
      onResult({
        liveFeatureCount:live.features.length,
        goodMatches:result.goodMatches,
        inliers:result.inliers,
        confidence:result.confidence,
        matched:result.confidence==="HOOG"||result.confidence==="MIDDEL"
      });
    }catch(error){
      onResult({error});
    }
  };

  run();
  recognitionTimer=setInterval(run,intervalMs);
}
