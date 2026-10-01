"use client";

import { useSyncExternalStore } from "react";
import { getAutoplay, subscribeSettings } from "@/lib/settings";

export function useAutoplay(): boolean {
  return useSyncExternalStore(subscribeSettings, getAutoplay, () => true);
}