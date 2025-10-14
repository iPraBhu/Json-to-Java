import { useEffect, useMemo, useRef } from 'react';
import type { GenerationRequest, GenerationResponse } from '../core/generator';
import type { WorkerRequest, WorkerResponse } from '../workers/generator.worker';

const TIMEOUT_MS = 5000;

export const useGeneratorWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const pendingMap = useRef(
    new Map<
      string,
      {
        resolve: (value: GenerationResponse) => void;
        reject: (reason?: unknown) => void;
        timeout: ReturnType<typeof setTimeout>;
      }
    >()
  );

  useEffect(() => {
    const worker = new Worker(new URL('../workers/generator.worker.ts', import.meta.url), {
      type: 'module'
    });
    workerRef.current = worker;

    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      const pending = pendingMap.current.get(message.requestId);
      if (!pending) {
        return;
      }
      clearTimeout(pending.timeout);
      pendingMap.current.delete(message.requestId);
      if (message.success) {
        pending.resolve(message);
      } else {
        pending.reject(new Error(message.error ?? 'Generation failed'));
      }
    };

    worker.addEventListener('message', handleMessage);
    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.terminate();
      pendingMap.current.forEach((pending) => {
        clearTimeout(pending.timeout);
        pending.reject(new Error('Worker terminated'));
      });
      pendingMap.current.clear();
    };
  }, []);

  const generate = useMemo(
    () =>
      (request: GenerationRequest) =>
        new Promise<GenerationResponse>((resolve, reject) => {
          const worker = workerRef.current;
          if (!worker) {
            reject(new Error('Worker unavailable'));
            return;
          }
          const requestId = crypto.randomUUID();
          const timeout = setTimeout(() => {
            pendingMap.current.delete(requestId);
            reject(new Error('Generation timed out')); // optional: maybe alert
          }, TIMEOUT_MS);
          pendingMap.current.set(requestId, { resolve, reject, timeout });
          const payload: WorkerRequest = { ...request, requestId };
          worker.postMessage(structuredClone(payload));
        }),
    []
  );

  return { generate };
};
