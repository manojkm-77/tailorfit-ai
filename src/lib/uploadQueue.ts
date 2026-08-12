/**
 * Offline-safe Upload Queue for TailorFit AI Multi-View Scans.
 * Persists scan payloads to IndexedDB/LocalStorage when network is offline,
 * and automatically retries background upload syncing when back online.
 */

export interface QueuedScanPayload {
  id: string;
  timestamp: string;
  frontImageUri: string;
  sideImageUri: string;
  backImageUri: string | null;
  heightCm: number;
  gender: 'male' | 'female';
  status: 'pending' | 'uploading' | 'synced' | 'failed';
  attempts: number;
}

const QUEUE_STORAGE_KEY = 'tailorfit_offline_upload_queue';

export function getQueuedScans(): QueuedScanPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveScanToOfflineQueue(
  frontImageUri: string,
  sideImageUri: string,
  backImageUri: string | null,
  heightCm: number,
  gender: 'male' | 'female'
): QueuedScanPayload {
  const queue = getQueuedScans();
  const newScan: QueuedScanPayload = {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    frontImageUri,
    sideImageUri,
    backImageUri,
    heightCm,
    gender,
    status: 'pending',
    attempts: 0,
  };
  queue.push(newScan);
  if (typeof window !== 'undefined') {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }
  return newScan;
}

export async function processOfflineQueue(
  apiUploadEndpoint = '/api/v1/scans/upload'
): Promise<number> {
  const queue = getQueuedScans();
  const pendingScans = queue.filter((s) => s.status === 'pending' || s.status === 'failed');
  let syncedCount = 0;

  for (const scan of pendingScans) {
    try {
      scan.status = 'uploading';
      scan.attempts += 1;
      
      // Attempt background POST sync to FastAPI microservice endpoint
      const response = await fetch(apiUploadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scan.id,
          front: scan.frontImageUri,
          side: scan.sideImageUri,
          back: scan.backImageUri,
          height_cm: scan.heightCm,
          gender: scan.gender,
        }),
      });

      if (response.ok) {
        scan.status = 'synced';
        syncedCount++;
      } else {
        scan.status = 'failed';
      }
    } catch {
      scan.status = 'failed';
    }
  }

  // Filter out successfully synced items
  const remaining = queue.filter((s) => s.status !== 'synced');
  if (typeof window !== 'undefined') {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remaining));
  }

  return syncedCount;
}
