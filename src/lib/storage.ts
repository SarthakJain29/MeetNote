import { useMemo, useSyncExternalStore } from "react";
import type { Meeting } from "./types";

const KEY = "meetnote.meetings.v1";
const EVENT = "meetnote:change";

/** Minimal Storage shape so the pure functions are testable without a browser. */
export interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

export function parseMeetings(raw: string | null): Meeting[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as Meeting[]) : [];
  } catch {
    return [];
  }
}

export function loadMeetings(kv: KV): Meeting[] {
  return parseMeetings(kv.getItem(KEY));
}

export function saveMeetings(kv: KV, meetings: Meeting[]) {
  kv.setItem(KEY, JSON.stringify(meetings));
}

export const addMeeting = (ms: Meeting[], m: Meeting) => [m, ...ms];
export const removeMeeting = (ms: Meeting[], id: string) => ms.filter((m) => m.id !== id);
export const updateMeeting = (ms: Meeting[], id: string, fn: (m: Meeting) => Meeting) =>
  ms.map((m) => (m.id === id ? fn(m) : m));
export const toggleTask = (m: Meeting, taskId: string): Meeting => ({
  ...m,
  actionItems: m.actionItems.map((a) => (a.id === taskId ? { ...a, done: !a.done } : a)),
});

// ---- browser binding (useSyncExternalStore keeps SSR + multi-tab consistent) ----
const browserKV = (): KV | null => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
const snapshot = () => browserKV()?.getItem(KEY) ?? "";
const serverSnapshot = () => "";

/** Returns { meetings, ready }. `ready` is false during SSR/hydration so UIs can show skeletons. */
export function useMeetings() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const meetings = useMemo(() => parseMeetings(raw || null), [raw]);
  return { meetings, ready: hydrated };
}

export function mutateMeetings(fn: (ms: Meeting[]) => Meeting[]) {
  const kv = browserKV();
  if (!kv) return;
  try {
    saveMeetings(kv, fn(loadMeetings(kv)));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    throw new Error("Could not save — browser storage is full or blocked.");
  }
}
