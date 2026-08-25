export const capabilitiesModule=Object.freeze({name:"Capabilities",ready:true});
export function getCapabilities(){
  return {
    secureContext:window.isSecureContext,
    camera:Boolean(navigator.mediaDevices?.getUserMedia),
    localStorage:(()=>{
      try{
        const k="__gift_ar_test__";
        localStorage.setItem(k,"1");
        localStorage.removeItem(k);
        return true;
      }catch{return false}
    })()
  };
}
