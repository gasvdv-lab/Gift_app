const STORAGE_KEY = "gift-ar-v0.3.0-recognition";
const MAX_REFERENCES = 3;
const SAMPLE_SIZE = 24;
const DEFAULT_THRESHOLD = 0.86;

let recognitionTimer = null;

export const recognitionModule = Object.freeze({
  name: "Recognition Engine",
  ready: true
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cropSquareFromVideo(video) {
  const width = video.videoWidth;
  const height = video.videoHeight;

  if (!width || !height) {
    throw new Error("Nog geen bruikbaar camerabeeld.");
  }

  const size = Math.min(width, height) * 0.68;
  const sx = (width - size) / 2;
  const sy = (height - size) / 2;

  return { sx, sy, size };
}

export function createDescriptor(video, canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas-context niet beschikbaar.");

  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;

  const { sx, sy, size } = cropSquareFromVideo(video);

  ctx.drawImage(
    video,
    sx, sy, size, size,
    0, 0, SAMPLE_SIZE, SAMPLE_SIZE
  );

  const image = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;
  const gray = new Float32Array(SAMPLE_SIZE * SAMPLE_SIZE);
  const hist = new Float32Array(24);

  let sum = 0;
  let sumSq = 0;

  for (let i = 0, p = 0; i < image.length; i += 4, p++) {
    const r = image[i];
    const g = image[i + 1];
    const b = image[i + 2];

    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[p] = y;
    sum += y;
    sumSq += y * y;

    hist[Math.min(7, Math.floor(r / 32))] += 1;
    hist[8 + Math.min(7, Math.floor(g / 32))] += 1;
    hist[16 + Math.min(7, Math.floor(b / 32))] += 1;
  }

  const n = gray.length;
  const mean = sum / n;
  const variance = Math.max(1, sumSq / n - mean * mean);
  const std = Math.sqrt(variance);

  const normalizedGray = Array.from(gray, value =>
    clamp((value - mean) / std, -3, 3)
  );

  const histTotal = SAMPLE_SIZE * SAMPLE_SIZE;
  const normalizedHist = Array.from(hist, value => value / histTotal);

  return {
    gray: normalizedGray,
    hist: normalizedHist
  };
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  if (!magA || !magB) return 0;
  return dot / Math.sqrt(magA * magB);
}

function histogramSimilarity(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff += Math.abs(a[i] - b[i]);
  }
  return clamp(1 - diff / 6, 0, 1);
}

export function compareDescriptors(current, reference) {
  const shape = clamp((cosineSimilarity(current.gray, reference.gray) + 1) / 2, 0, 1);
  const color = histogramSimilarity(current.hist, reference.hist);

  return 0.78 * shape + 0.22 * color;
}

export function getReferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_REFERENCES) : [];
  } catch {
    return [];
  }
}

export function saveReference(descriptor) {
  const refs = getReferences();

  if (refs.length >= MAX_REFERENCES) {
    throw new Error("Er zijn al drie referentie-aanzichten geregistreerd.");
  }

  refs.push(descriptor);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(refs));
  return refs.length;
}

export function clearReferences() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getMaxReferences() {
  return MAX_REFERENCES;
}

export function getThreshold() {
  return DEFAULT_THRESHOLD;
}

export function stopRecognitionLoop() {
  if (recognitionTimer !== null) {
    window.clearInterval(recognitionTimer);
    recognitionTimer = null;
  }
}

export function startRecognitionLoop({ video, canvas, onResult, intervalMs = 650 }) {
  stopRecognitionLoop();

  const refs = getReferences();
  if (!refs.length) {
    throw new Error("Registreer eerst minstens één aanzicht.");
  }

  const run = () => {
    try {
      const current = createDescriptor(video, canvas);
      let best = 0;

      for (const ref of refs) {
        best = Math.max(best, compareDescriptors(current, ref));
      }

      onResult({
        similarity: best,
        matched: best >= DEFAULT_THRESHOLD
      });
    } catch (error) {
      onResult({
        error
      });
    }
  };

  run();
  recognitionTimer = window.setInterval(run, intervalMs);
}
