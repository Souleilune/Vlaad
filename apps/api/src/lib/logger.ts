export function logInfo(message: string, meta?: Record<string, unknown>) {
  console.log(JSON.stringify({ level: "info", message, ...meta }));
}

export function logError(message: string, meta?: Record<string, unknown>) {
  console.error(JSON.stringify({ level: "error", message, ...meta }));
}

export function createTimer() {
  const startedAt = performance.now();

  return {
    elapsedMs() {
      return Number((performance.now() - startedAt).toFixed(1));
    }
  };
}
