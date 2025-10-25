// Gestionnaire de sons (stub, non branché)
import { soundFiles } from "./sounds";

const loaded = new Map();

export async function load(name) {
  const url = soundFiles[name];
  if (!url) return null;
  if (loaded.has(name)) return loaded.get(name);
  const audio = new Audio(url);
  loaded.set(name, audio);
  return audio;
}

export async function play(name) {
  const audio = await load(name);
  if (!audio) return;
  try {
    // Cloner pour jouer des sons concurrents sans couper la fin
    const clone = audio.cloneNode();
    await clone.play();
  } catch (_) {
    // muet si l'autoplay est bloqué; l'intégration finale gèrera l'interaction utilisateur
  }
}

export function unload(name) {
  loaded.delete(name);
}

