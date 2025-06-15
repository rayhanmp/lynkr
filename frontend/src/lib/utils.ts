import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/*
  @param fn - The function to debounce.
  @param delay - The delay in milliseconds.
  @returns A debounced function.

  Debounce a promise-returning function.
  Useful for debouncing API calls that are called frequently.
  It will:
  - cancel the previous call if it hasn't started yet.
  - return the result of the last call.
  - reject if the previous call is cancelled.
  - reject if the function throws an error.
  - reject if the function is aborted.
*/
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
