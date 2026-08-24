const STORAGE_KEY="gift-ar-v0.4.0-feature-recognition";
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
    const p=()=>({
      x:Math.round((rand()*2-1)*7),
      y:Math.round((rand()*2-1)*7)
    });
    pairs.push([p(),p()]);
  }
  return pairs;
}
const BRIEF_PAIRS=seededPairs();

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

function captureGray(video,canvas){
  const w=video.videoWidth,h=video.videoHeight;
  if(!w||!h)throw new Error("Nog geen bruikbaar camerabeeld.");
  const ctx=canvas.getContext("2d",{willReadFrequently:true});
  if(!ctx)throw new Error("Canvas-context niet beschikbaar.");
  canvas.width=SIZE;canvas.height=SIZE;
  const cropSize=Math.min(w,h)*0.68;
  const sx=(w-cropSize)/2,sy=(h-cropSize)/2;
  ctx.drawImage(video,sx,sy,cropSize,cropSize,0,0,SIZE,SIZE);
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
          const gx=(gray[i+1]-gray[i-1])*0.5;
          const gy=(gray[i+SIZE]-gray[i-SIZE])*0.5;
          sxx+=gx*gx;syy+=gy*gy;sxy+=gx*gy;
        }
      }
      const det=sxx*syy-sxy*sxy;
      const trace=sxx+syy;
      const score=det-0.045*trace*trace;
      if(score>0.25)candidates.push({x,y,score});
    }
  }
  candidates.sort((a,b)=>b.score-a.score);
  const selected=[];
  const minDist2=36;
  for(const c of candidates){
    let near=false;
    for(const s of selected){
      const dx=c.x-s.x,dy=c.y-s.y;
      if(dx*dx+dy*dy<minDist2){near=true;break}
    }
    if(!near){
      selected.push(c);
      if(selected.length>=MAX_FEATURES)break;
    }
  }
  return selected;
}

function briefDescriptor(gray,x,y){
  const bits=new Array(DESCRIPTOR_BITS);
  for(let i=0;i<DESCRIPTOR_BITS;i++){
    const [a,b]=BRIEF_PAIRS[i];
    const ax=clamp(x+a.x,0,SIZE-1),ay=clamp(y+a.y,0,SIZE-1);
    const bx=clamp(x+b.x,0,SIZE-1),by=clamp(y+b.y,0,SIZE-1);
    bits[i]=gray[ay*SIZE+ax]<gray[by*SIZE+bx]?1:0;
  }
  return bits;
}

function featureCoverage(features){
  if(!features.length)return 0;
  const cells=new Set();
  for(const f of features){
    const cx=Math.min(3,Math.floor(f.x*4));
    const cy=Math.min(3,Math.floor(f.y*4));
    cells.add(`${cx}:${cy}`);
  }
  return cells.size/16;
}

export function extractFeatures(video,canvas){
  const gray=captureGray(video,canvas);
  const corners=cornerCandidates(gray);
  const features=corners.map(c=>({
    x:c.x/(SIZE-1),
    y:c.y/(SIZE-1),
    score:c.score,
    descriptor:briefDescriptor(gray,c.x,c.y)
  }));
  return {
    features,
    coverage:featureCoverage(features)
  };
}

function hamming(a,b){
  let d=0;
  for(let i=0;i<a.length;i++)if(a[i]!==b[i])d++;
  return d;
}

function matchFeatures(current,reference){
  const matches=[];
  for(let ci=0;ci<current.length;ci++){
    let best={d:Infinity,ri:-1},second=Infinity;
    for(let ri=0;ri<reference.length;ri++){
      const d=hamming(current[ci].descriptor,reference[ri].descriptor);
      if(d<best.d){second=best.d;best={d,ri}}
      else if(d<second)second=d;
    }
    if(best.ri>=0&&best.d<=MATCH_DISTANCE_MAX&&best.d<second*RATIO_LIMIT){
      matches.push({
        current:current[ci],
        reference:reference[best.ri],
        distance:best.d
      });
    }
  }

  matches.sort((a,b)=>a.distance-b.distance);
  const usedRef=new Set();
  return matches.filter(m=>{
    const key=`${m.reference.x.toFixed(4)}:${m.reference.y.toFixed(4)}`;
    if(usedRef.has(key))return false;
    usedRef.add(key);
    return true;
  });
}

function estimateSimilarity(m1,m2){
  const r1=m1.reference,r2=m2.reference,c1=m1.current,c2=m2.current;
  const rdx=r2.x-r1.x,rdy=r2.y-r1.y;
  const cdx=c2.x-c1.x,cdy=c2.y-c1.y;
  const rlen=Math.hypot(rdx,rdy),clen=Math.hypot(cdx,cdy);
  if(rlen<0.05||clen<0.03)return null;
  const scale=clen/rlen;
  if(scale<0.45||scale>2.2)return null;
  const ra=Math.atan2(rdy,rdx),ca=Math.atan2(cdy,cdx);
  const angle=ca-ra,cos=Math.cos(angle),sin=Math.sin(angle);
  const tx=c1.x-scale*(cos*r1.x-sin*r1.y);
  const ty=c1.y-scale*(sin*r1.x+cos*r1.y);
  return {scale,cos,sin,tx,ty};
}

function transformPoint(p,t){
  return {
    x:t.tx+t.scale*(t.cos*p.x-t.sin*p.y),
    y:t.ty+t.scale*(t.sin*p.x+t.cos*p.y)
  };
}

function geometricVerification(matches){
  if(matches.length<2)return {inliers:0,model:null};
  let bestInliers=0,bestModel=null;
  const limit=Math.min(matches.length,28);

  for(let i=0;i<limit;i++){
    for(let j=i+1;j<limit;j++){
      const model=estimateSimilarity(matches[i],matches[j]);
      if(!model)continue;
      let inliers=0;
      for(const m of matches){
        const p=transformPoint(m.reference,model);
        const e=Math.hypot(p.x-m.current.x,p.y-m.current.y);
        if(e<=INLIER_ERROR)inliers++;
      }
      if(inliers>bestInliers){bestInliers=inliers;bestModel=model}
    }
  }
  return {inliers:bestInliers,model:bestModel};
}

function confidenceFrom(inliers,goodMatches,liveFeatures){
  if(inliers>=12&&goodMatches>=14)return "HOOG";
  if(inliers>=8&&goodMatches>=10)return "MIDDEL";
  if(inliers>=5&&goodMatches>=7)return "LAAG";
  return "GEEN";
}

export function evaluateRecognition(liveFeatures,refs){
  let best={goodMatches:0,inliers:0,confidence:"GEEN",referenceIndex:-1};

  refs.forEach((ref,index)=>{
    const matches=matchFeatures(liveFeatures,ref.features);
    const geo=geometricVerification(matches);
    const confidence=confidenceFrom(geo.inliers,matches.length,liveFeatures.length);

    if(
      geo.inliers>best.inliers ||
      (geo.inliers===best.inliers&&matches.length>best.goodMatches)
    ){
      best={
        goodMatches:matches.length,
        inliers:geo.inliers,
        confidence,
        referenceIndex:index
      };
    }
  });

  return best;
}

export function getReferences(){
  try{
    const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
    return Array.isArray(parsed)?parsed.slice(0,MAX_REFERENCES):[];
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

export function qualityLabel(featureCount,coverage){
  if(featureCount>=50&&coverage>=0.45)return "GOED";
  if(featureCount>=28&&coverage>=0.28)return "MATIG";
  return "MOEILIJK";
}

export function stopRecognitionLoop(){
  if(recognitionTimer!==null){
    clearInterval(recognitionTimer);
    recognitionTimer=null;
  }
}

export function startRecognitionLoop({video,canvas,onResult,intervalMs=750}){
  stopRecognitionLoop();
  const refs=getReferences();
  if(!refs.length)throw new Error("Registreer eerst minstens één aanzicht.");

  const run=()=>{
    try{
      const live=extractFeatures(video,canvas);
      const result=evaluateRecognition(live.features,refs);
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
