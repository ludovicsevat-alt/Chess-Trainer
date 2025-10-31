// Gestionnaire de sons (intégration basique)
import { soundFiles } from "./sounds";

const loaded = new Map();
let initialized = false;
let muted = JSON.parse(localStorage.getItem("sound.muted") ?? "false");
let volume = Number(localStorage.getItem("sound.volume") ?? "0.8");

export function isMuted() {
  return muted;
}

export function getVolume() {
  return volume;
}

export function setMuted(v) {
  muted = !!v;
  localStorage.setItem("sound.muted", JSON.stringify(muted));
}

export function setVolume(v) {
  volume = Math.max(0, Math.min(1, Number(v)));
  localStorage.setItem("sound.volume", String(volume));
}

export async function load(name) {
  const url = soundFiles[name];
  if (!url) return null;
  if (loaded.has(name)) return loaded.get(name);
  const audio = new Audio(url);
  audio.preload = "auto";
  audio.volume = volume;
  loaded.set(name, audio);
  return audio;
}

export async function play(name) {
  if (muted) return;
  const base = await load(name);
  if (!base) return;
  try {
    // clone pour permettre chevauchement
    const a = base.cloneNode();
    a.volume = volume;
    await a.play();
  } catch {
    // probablement bloque par l'autoplay; attendre un geste utilisateur
  }
}

export function unload(name) {
  loaded.delete(name);
}

export function initOnUserGesture() {
  if (initialized) return;
  const handler = async () => {
    initialized = true;
    // précharger les sons de base
    await Promise.all([
      load("move"),
      load("capture"),
      load("check"),
      load("checkmate"),
    ]);
    window.removeEventListener("pointerdown", handler);
    window.removeEventListener("click", handler);
  };
  window.addEventListener("pointerdown", handler, { once: true });
  window.addEventListener("click", handler, { once: true });
}

