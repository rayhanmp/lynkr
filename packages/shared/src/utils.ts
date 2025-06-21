// Debounce a promise-returning function (useful for API calls)
export function debouncePromise<F extends (...a: any[]) => Promise<any>>(
  fn: F,
  delay = 500
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastReject: ((reason?: unknown) => void) | undefined;
  let lastController: AbortController | undefined;

  return (...args: Parameters<F>) =>
    new Promise<Awaited<ReturnType<F>>>((resolve, reject) => {
      if (lastReject) {
        lastReject(Object.assign(new Error("Debounced"), { cancelled: true }));
      }
      lastReject = reject;

      if (lastController) lastController.abort();
      lastController = new AbortController();

      clearTimeout(timer);
      timer = setTimeout(async () => {
        lastReject = undefined;
        try {
          const result = await fn(...args, lastController!.signal);
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          lastController = undefined;
        }
      }, Math.max(0, delay));
    });
}

// Constant-time comparison to prevent timing attacks
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let c = 0;
  for (let i = 0; i < a.byteLength; i++) {
    c |= a[i] ^ b[i];
  }
  return c === 0;
}

// Common email normalization pattern used throughout the codebase
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
} 

export const generateSecureRandomString = (stringLength: number) => {
    const alphabet = "abcdefghijklmnpqrstuvwxyz23456789";
    const chunkSize = 24;
  
    const output: string[] = [];
    const n = alphabet.length;
    // Calculate rejection threshold to avoid modulo bias
    const max = 256 - (256 % n);
  
    // Generate random bytes in chunks until we have the desired string length
      while (output.length < stringLength) {
      const bytes = new Uint8Array(chunkSize);
      crypto.getRandomValues(bytes);
  
      for (const b of bytes) {
        // Rejection sampling: only use bytes that don't cause modulo bias
        if (b < max) {
          output.push(alphabet[b % n]);
          if (output.length === stringLength) {
            break;
          }
        }
      }
    }
    return output.join("");
  }
  
  export function bufferToBase64(buf: Uint8Array): string {
      return Buffer.from(buf).toString("base64");
    }
    
  export function base64ToBuffer(str: string): Uint8Array {
      return new Uint8Array(Buffer.from(str, "base64"));
    }
  