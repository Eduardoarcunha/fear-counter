// Simple in-memory store + pub/sub (resets on server restart)
let FEAR = 0;
export const MAX_FEAR = 15;

type Listener = (value: number) => void;
const listeners = new Set<Listener>();

function clamp(n: number, min = 0, max = MAX_FEAR) {
  return Math.max(min, Math.min(max, n));
}

export function getFear() {
  return FEAR;
}

export function setFear(n: number) {
  const v = clamp(Number.isFinite(n) ? n : 0);
  if (v === FEAR) return FEAR;
  FEAR = v;
  listeners.forEach((fn) => fn(FEAR));
  return FEAR;
}

export function incFear(delta = 1) {
  return setFear(FEAR + delta);
}

export function decFear(delta = 1) {
  return setFear(FEAR - delta);
}

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
