export function createGiftState() {
  return Object.freeze({
    activeGiftId: null,
    status: "idle"
  });
}
