import { generateModel, GenerationRequest, GenerationResponse } from '../core/generator';

export type WorkerRequest = GenerationRequest & { requestId: string };
export type WorkerResponse = GenerationResponse & { requestId: string; success: boolean; error?: string };

self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const payload = event.data;
  try {
    const response = generateModel({ kind: payload.kind, text: payload.text, options: payload.options });
    const message: WorkerResponse = {
      ...response,
      requestId: payload.requestId,
      success: true
    };
    self.postMessage(structuredClone(message));
  } catch (error) {
    const message: WorkerResponse = {
      files: {},
      warnings: [],
      diagnostics: [(error as Error).message],
      meta: { classCount: 0, enumCount: 0 },
      requestId: payload.requestId,
      success: false,
      error: (error as Error).message
    };
    self.postMessage(structuredClone(message));
  }
});
