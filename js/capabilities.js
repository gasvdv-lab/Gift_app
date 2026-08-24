export function getBasicCapabilities(){
  return {
    secureContext:window.isSecureContext,
    getUserMediaPresent:Boolean(navigator.mediaDevices?.getUserMedia),
    localStoragePresent:(()=>{
      try{
        const k="__gift_ar_test__";
        localStorage.setItem(k,"1");
        localStorage.removeItem(k);
        return true;
      }catch{return false}
    })()
  };
}
