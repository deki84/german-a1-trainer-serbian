"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

function isSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined"
  );
}

const noopSubscribe = () => () => {};

export function useRecorder() {
  // Auf dem Server false, im Browser die echte Prüfung (kein Hydration-Fehler)
  const supported = useSyncExternalStore(noopSubscribe, isSupported, () => false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  // Mikrofon freigeben, wenn die Seite verlassen wird
  useEffect(
    () => () => recorderRef.current?.stream.getTracks().forEach((track) => track.stop()),
    [],
  );

  async function start(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.start();
    recorderRef.current = recorder;
    startedAtRef.current = Date.now();
  }

  // Liest direkt den Recorder statt eines React-Zustands, der in Event-Handlern veraltet sein kann
  function isRecording(): boolean {
    return recorderRef.current?.state === "recording";
  }

  // Liefert die Aufnahme und wie lange sie gedauert hat
  function stop(): Promise<{ blob: Blob; durationMs: number } | null> {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === "inactive") return resolve(null);
      const durationMs = Date.now() - startedAtRef.current;
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((track) => track.stop()); // rotes Mikrofon-Symbol aus
        resolve({ blob: new Blob(chunksRef.current, { type: recorder.mimeType }), durationMs });
      };
      recorder.stop();
    });
  }

  return { supported, start, stop, isRecording };
}
