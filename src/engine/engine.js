export function createEngine() {
  const worker = new Worker(new URL('./worker.js', import.meta.url), {
    type: 'classic', // ⬅️ change 'module' en 'classic'
  });

  const listeners = new Set();

  worker.onmessage = (e) => {
    const { type, data, error } = e.data || {};
    if (type === 'ready') {
      console.log('Stockfish prêt');
    } else if (type === 'line') {
      listeners.forEach(fn => fn(data));
    } else if (type === 'error') {
      console.error('Worker error:', error);
    } else if (typeof e.data === 'string') {
      listeners.forEach(fn => fn(e.data));
    }
  };

  return {
    post(cmd) { worker.postMessage(cmd); },
    onLine(cb) { listeners.add(cb); return () => listeners.delete(cb); },
    go({ position = 'startpos', moves = '', depth = 12 } = {}) {
      worker.postMessage({ type: 'go', position, moves, depth });
    },
    destroy() { worker.terminate(); },
  };
}
