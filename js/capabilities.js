export function getBasicCapabilities() {
  return {
    secureContext: window.isSecureContext,
    webxrApiPresent: "xr" in navigator,
    mediaDevicesPresent: Boolean(navigator.mediaDevices),
    getUserMediaPresent: Boolean(navigator.mediaDevices?.getUserMedia),
    localStoragePresent: (() => {
      try {
        const key = "__gift_ar_test__";
        localStorage.setItem(key, "1");
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    })()
  };
}
