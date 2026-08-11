'use client';

import { PoseLandmarks33 } from '@/types/measurement';

export const POSE_LANDMARKER_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export const POSE_WASM_BASE = '/wasm';

export interface PoseDetectionResult {
  landmarks: PoseLandmarks33 | null;
  confidence: number; // 0..1 average landmark visibility
}

type WorkerResponse =
  | { type: 'ready' }
  | { type: 'result'; requestId: number; landmarks: PoseLandmarks33 | null; confidence: number }
  | { type: 'error'; requestId?: number; message: string };

let workerPromise: Promise<Worker> | null = null;
let requestSeq = 0;
const pending = new Map<number, { resolve: (r: PoseDetectionResult) => void; reject: (e: unknown) => void }>();

function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = new Promise<Worker>((resolve, reject) => {
      try {
        const worker = new Worker(new URL('./mediapipe.worker.ts', import.meta.url), { type: 'module' });

        worker.onerror = (event) => reject(new Error(event.message || 'Pose worker crashed'));

        worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          const msg = event.data;
          if (msg.type === 'ready') {
            resolve(worker);
            return;
          }
          if (msg.type === 'error') {
            if (msg.requestId !== undefined) {
              const job = pending.get(msg.requestId);
              if (job) {
                pending.delete(msg.requestId);
                job.reject(new Error(msg.message));
              }
            } else {
              reject(new Error(msg.message));
            }
            return;
          }
          const job = pending.get(msg.requestId);
          if (job) {
            pending.delete(msg.requestId);
            job.resolve({ landmarks: msg.landmarks, confidence: msg.confidence });
          }
        };

        worker.postMessage({
          type: 'init',
          wasmBase: POSE_WASM_BASE,
          modelAssetPath: POSE_LANDMARKER_MODEL_URL,
        });
      } catch (err) {
        reject(err);
      }
    });
    workerPromise.catch(() => {
      workerPromise = null;
    });
  }
  return workerPromise;
}

function postDetect(kind: 'detect_image' | 'detect_video', bitmap: ImageBitmap): Promise<PoseDetectionResult> {
  return new Promise((resolve, reject) => {
    const requestId = ++requestSeq;
    pending.set(requestId, { resolve, reject });
    getWorker()
      .then((worker) => worker.postMessage({ type: kind, requestId, bitmap }, [bitmap]))
      .catch((err) => {
        pending.delete(requestId);
        reject(err);
      });
  });
}

/**
 * Initializes the pose worker + PoseLandmarker models. Returns true when ready.
 * Safe to call repeatedly — the underlying worker is a singleton per page session.
 */
export async function initPoseDetector(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return false;
  try {
    await getWorker();
    return true;
  } catch {
    return false;
  }
}

async function toImageBitmap(source: Blob | string | ImageBitmap | HTMLCanvasElement | HTMLVideoElement): Promise<ImageBitmap> {
  if (source instanceof ImageBitmap) return source;
  if (typeof source === 'string') {
    const blob = await (await fetch(source)).blob();
    return createImageBitmap(blob);
  }
  if (source instanceof Blob) return createImageBitmap(source);
  return createImageBitmap(source);
}

/**
 * Runs single-frame pose detection on an uploaded photo (data URL, Blob, canvas, or bitmap).
 * The bitmap is transferred to the worker so decoding never blocks the UI thread.
 */
export async function detectPoseFromImage(
  source: Blob | string | ImageBitmap | HTMLCanvasElement
): Promise<PoseDetectionResult> {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return { landmarks: null, confidence: 0 };
  }
  const bitmap = await toImageBitmap(source);
  return postDetect('detect_image', bitmap);
}

/**
 * Runs pose detection on the current video frame for live webcam quality checks.
 * Works in real camera streams via transferable ImageBitmap frames.
 */
export async function detectPoseFromVideoFrame(
  video: HTMLVideoElement
): Promise<PoseDetectionResult> {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return { landmarks: null, confidence: 0 };
  }
  const bitmap = await toImageBitmap(video);
  return postDetect('detect_video', bitmap);
}
