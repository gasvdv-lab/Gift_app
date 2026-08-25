export const objectIsolationModule=Object.freeze({
  name:"Object Isolation",
  ready:true,
  method:"local-border-model-v1",
  aiReady:true
});

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

function meanBorderColor(data,w,h){
  let r=0,g=0,b=0,n=0;
  const band=Math.max(2,Math.round(Math.min(w,h)*0.08));

  const take=(x,y)=>{
    const i=(y*w+x)*4;
    r+=data[i];g+=data[i+1];b+=data[i+2];n++;
  };

  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      if(x<band||x>=w-band||y<band||y>=h-band)take(x,y);
    }
  }

  return {r:r/n,g:g/n,b:b/n};
}

function colorDistance(r,g,b,bg){
  const dr=r-bg.r,dg=g-bg.g,db=b-bg.b;
  return Math.sqrt(dr*dr+dg*dg+db*db);
}

function smoothMask(mask,w,h){
  const out=new Uint8Array(mask.length);
  for(let y=1;y<h-1;y++){
    for(let x=1;x<w-1;x++){
      let sum=0;
      for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++)sum+=mask[(y+yy)*w+(x+xx)];
      out[y*w+x]=sum>=5?1:0;
    }
  }
  return out;
}

export function isolateObject(sourceCanvas,targetCanvas,sensitivity=55){
  const w=sourceCanvas.width,h=sourceCanvas.height;
  if(!w||!h)throw new Error("Geen geldige crop voor isolatie.");

  targetCanvas.width=w;
  targetCanvas.height=h;

  const src=sourceCanvas.getContext("2d",{willReadFrequently:true});
  const dst=targetCanvas.getContext("2d");
  const img=src.getImageData(0,0,w,h);
  const bg=meanBorderColor(img.data,w,h);

  const threshold=35+(100-clamp(sensitivity,20,100))*1.15;
  let mask=new Uint8Array(w*h);

  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const i=(y*w+x)*4;
      const d=colorDistance(img.data[i],img.data[i+1],img.data[i+2],bg);

      const nx=(x-(w-1)/2)/((w-1)/2);
      const ny=(y-(h-1)/2)/((h-1)/2);
      const centerBonus=Math.max(0,1-Math.sqrt(nx*nx+ny*ny))*22;

      mask[y*w+x]=(d+centerBonus>=threshold)?1:0;
    }
  }

  mask=smoothMask(mask,w,h);
  mask=smoothMask(mask,w,h);

  const out=dst.createImageData(w,h);
  let objectPixels=0;

  for(let p=0;p<w*h;p++){
    const i=p*4;
    const keep=mask[p]===1;
    out.data[i]=img.data[i];
    out.data[i+1]=img.data[i+1];
    out.data[i+2]=img.data[i+2];
    out.data[i+3]=keep?255:0;
    if(keep)objectPixels++;
  }

  dst.clearRect(0,0,w,h);
  dst.putImageData(out,0,0);

  const objectRatio=objectPixels/(w*h);
  return {
    isolatedDataUrl:targetCanvas.toDataURL("image/png"),
    objectRatio,
    method:"local-border-model-v1",
    sensitivity
  };
}
