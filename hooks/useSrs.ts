"use client";

import { useSyncExternalStore } from "react";
import { getSrsServerSnapshot, getSrsSnapshot, subscribeSrs } from "@/lib/srsStorage";
import type { SrsState } from "@/lib/srs";

export function useSrs(): SrsState {
  return useSyncExternalStore(subscribeSrs, getSrsSnapshot, getSrsServerSnapshot);
}
