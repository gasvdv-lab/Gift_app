export function getBasicCapabilities() {
  return {
    secureContext: window.isSecureContext,
    modules: "supported",
    webxrApiPresent: "xr" in navigator,
    mediaDevicesPresent: Boolean(navigator.mediaDevices)
  };
}
