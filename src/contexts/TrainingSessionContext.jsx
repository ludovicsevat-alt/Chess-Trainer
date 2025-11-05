/* eslint react-refresh/only-export-components: ["error", { allowExportNames: ["useTrainingSession"] }] */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import useGuidedTrainingGame from "../hooks/useGuidedTrainingGame";
import useSemiGuidedTrainingGame from "../hooks/useSemiGuidedTrainingGame";
import TrainingSessionResetGuard from "./trainingSessionResetGuard";

const TrainingSessionContext = createContext(undefined);

async function fetchOpeningData(slug, subOpeningFile, signal) {
  const openingDir = slug.replace("-system", "");
  const mainResponse = await fetch(`/data/openings/${openingDir}/${slug}.json`, { signal });
  if (!mainResponse.ok) {
    throw new Error(`Impossible de charger les donnees pour ${slug} (${mainResponse.status})`);
  }
  const mainData = await mainResponse.json();

  const file = subOpeningFile || mainData.subOpenings[0].file;

  const subResponse = await fetch(`/data/openings/${openingDir}/${file}`, { signal });
  if (!subResponse.ok) {
    throw new Error(`Impossible de charger les donnees pour ${file} (${subResponse.status})`);
  }
  const subData = await subResponse.json();

  return { ...mainData, ...subData };
}

function pickGuidedScript(data, side) {
  const scripts = data?.trainingScripts?.guided ?? [];
  if (!scripts.length) return null;
  const exact = scripts.find((item) => item.side === side);
  if (exact) return exact;
  const anySide = scripts.find((item) => !item.side || item.side === "both");
  return anySide ?? scripts[0];
}

function pickSemiScript(data, side) {
  const scripts = data?.trainingScripts?.semiGuided ?? [];
  if (!scripts.length) return null;
  const exact = scripts.find((item) => item.side === side);
  if (exact) return exact;
  const anySide = scripts.find((item) => !item.side || item.side === "both");
  return anySide ?? scripts[0];
}

export function TrainingSessionProvider({
  openingSlug,
  side = "white",
  initialMode = "guided",
  onExit,
  children,
}) {
  const [openingData, setOpeningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(initialMode);
  const [elo, setElo] = useState(1200);
  const [trainingActive, setTrainingActive] = useState(false);
  const [subOpeningFile, setSubOpeningFile] = useState(null);
  const abortRef = useRef();
  const _startAfterLoad = useRef(false);
  const resetGuardRef = useRef(new TrainingSessionResetGuard());

  const startTraining = useCallback((fileToLoad) => {
    if (fileToLoad) {
      setSubOpeningFile(fileToLoad);
    }
    if (loading) {
      _startAfterLoad.current = true;
    } else {
      setTrainingActive(true);
      resetGuardRef.current.trigger(mode, true);
    }
  }, [loading, mode]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setOpeningData(null);
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    fetchOpeningData(openingSlug, subOpeningFile, controller.signal)
      .then((data) => {
        setOpeningData(data);
        setLoading(false);
        if (_startAfterLoad.current) {
          startTraining();
          _startAfterLoad.current = false;
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err);
        setLoading(false);
        if (_startAfterLoad.current) {
          _startAfterLoad.current = false;
        }
      });

    return () => {
      controller.abort();
    };
  }, [openingSlug, subOpeningFile]);

  const guidedScript = useMemo(
    () => (openingData ? pickGuidedScript(openingData, side) : null),
    [openingData, side]
  );

  const semiScript = useMemo(
    () => (openingData ? pickSemiScript(openingData, side) : null),
    [openingData, side]
  );

  const guidedSession = useGuidedTrainingGame({
    script: mode === "guided" ? guidedScript : null,
    playerSide: side,
    elo,
    active: trainingActive && mode === "guided",
  });

  const semiSession = useSemiGuidedTrainingGame({
    script: mode === "semi" ? semiScript : null,
    playerSide: side,
    elo,
    active: trainingActive && mode === "semi",
  });

  useEffect(() => {
    resetGuardRef.current.update({
      guidedReset: guidedSession?.resetSequence,
      semiReset: semiSession?.resetSequence,
    });
  }, [guidedSession, semiSession]);

  useEffect(() => {
    setTrainingActive(false);
    resetGuardRef.current.trigger("guided", false);
    resetGuardRef.current.trigger("semi", false);
  }, [mode, guidedScript, semiScript]);

  const canStartTraining =
    !loading &&
    !error &&
    ((mode === "guided" && guidedScript) ||
      (mode === "semi" && semiScript));

  const resetTraining = useCallback(() => {
    if (!trainingActive) return;
    setTrainingActive(false);
    resetGuardRef.current.trigger("guided", false);
    resetGuardRef.current.trigger("semi", false);
  }, [trainingActive]);

  const value = useMemo(
    () => ({
      loading,
      error,
      openingSlug,
      openingData,
      side,
      mode,
      setMode,
      elo,
      setElo,
      trainingActive,
      canStartTraining,
      startTraining,
      resetTraining,
      onExit,
      guidedScript,
      semiScript,
      guidedSession,
      semiSession,
      setSubOpeningFile,
    }),
    [
      loading,
      error,
      openingSlug,
      openingData,
      side,
      mode,
      elo,
      trainingActive,
      canStartTraining,
      setMode,
      setElo,
      startTraining,
      resetTraining,
      onExit,
      guidedScript,
      semiScript,
      guidedSession,
      semiSession,
      setSubOpeningFile,
    ]
  );

  return (
    <TrainingSessionContext.Provider value={value}>
      {children}
    </TrainingSessionContext.Provider>
  );
}

export function useTrainingSession() {
  const context = useContext(TrainingSessionContext);
  if (context === undefined) {
    throw new Error("useTrainingSession doit etre utilise dans un TrainingSessionProvider");
  }
  return context;
}