export const aiAssistanceModule=Object.freeze({
  name:"AI Assistance",
  ready:true,
  active:false,
  role:"future segmentation/quality/embedding assistance"
});

export function describeIsolationCapability(){
  return {
    aiModelLoaded:false,
    localFallbackAvailable:true,
    message:"v0.6.0 gebruikt een lokale isolatie-baseline. De AI-segmentatie-interface is voorbereid maar nog niet afhankelijk van een extern model."
  };
}
