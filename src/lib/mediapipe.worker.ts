/// <reference lib="webworker" />
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { PoseLandmarks33 } from '@/types/measurement';
import { mapMediaPipeLandmarks } from './poseMapping';

interface InitMessage {
  type: 'init';
  wasmBase: string;
  modelAssetPath: string;
}

interface DetectMessage {
  type: 'detect_image' | 'detect_video';
  requestId: number;
  bitmap: ImageBitmap;
}

type WorkerRequest = InitMessage | DetectMessage;

const ctx = self as unknown as DedicatedWorkerGlobalScope;

let wasmBase = '';
let modelAssetPath = '';
let imageLandmarker: PoseLandmarker | null = null;
let videoLandmarker: PoseLandmarker | null = null;
let initPromise: Promise<void> | null = null;

function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(wasmBase);
      const baseOptions = { modelAssetPath, delegate: 'GPU' as const };
      const shared = {
        baseOptions,
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      };
      imageLandmarker = await PoseLandmarker.createFromOptions(vision, { ...shared, runningMode: 'IMAGE' as const });
      videoLandmarker = await PoseLandmarker.createFromOptions(vision, { ...shared, runningMode: 'VIDEO' as const });
    })();
    initPromise.catch(() => {
      initPromise = null;
    });
  }
  return initPromise;
}

function handleDetect(req: DetectMessage): void {
  const run = async () => {
    await ensureInitialized();
    const result =
      req.type === 'detect_image'
        ? imageLandmarker!.detect(req.bitmap)
        : videoLandmarker!.detectForVideo(req.bitmap, performance.now());
    const raw = result.landmarks?.[0];
    const landmarks: PoseLandmarks33 | null = raw && raw.length >= 33 ? mapMediaPipeLandmarks(raw) : null;
    const confidence = raw?.length
      ? raw.reduce((sum, lm) => sum + (lm.visibility ?? 0), 0) / raw.length
      : 0;
    req.bitmap.close?.();
    ctx.postMessage({ type: 'result', requestId: req.requestId, landmarks, confidence });
  };
  run().catch((err) => {
    req.bitmap.close?.();
    ctx.postMessage({
      type: 'error',
      requestId: req.requestId,
      message: err instanceof Error ? err.message : String(err),
    });
  });
}

ctx.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;

  if (req.type === 'init') {
    wasmBase = req.wasmBase;
    modelAssetPath = req.modelAssetPath;
    ensureInitialized()
      .then(() => ctx.postMessage({ type: 'ready' }))
      .catch((err) =>
        ctx.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) })
      );
    return;
  }

  handleDetect(req);
};
