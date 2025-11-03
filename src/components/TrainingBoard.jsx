import { useSettings } from "../contexts/SettingsContext";
import { useTrainingSession } from "../contexts/TrainingSessionContext";
import BoardView from "./BoardView";
import PlayerInfoPanel from "./PlayerInfoPanel";

function formatScore(score) {
  if (score === null || score === undefined) return null;
  if (Math.abs(score) >= 999) {
    return score > 0 ? "Mate pour vous" : "Mate imminent";
  }
  const rounded = Math.round(score * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

export default function TrainingBoard() {
  const { settings, boardThemeConfig, messages } = useSettings();
  const {
    loading,
    error,
    mode,
    guidedSession,
    semiSession,
    onExit,
    guidedScript,
    semiScript,
    trainingActive,
    canStartTraining,
  } = useTrainingSession();

  const animationDuration = settings.animationEnabled ? settings.animationDuration : 0;

  if (loading) {
    return (
      <div className="content">
        <div className="panel" style={{ marginTop: 32, textAlign: "center" }}>
          <div className="panel-title">Chargement de l'entrainement...</div>
          <div className="muted">Preparation du coach et des lignes.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <div className="panel panel-danger" style={{ marginTop: 32 }}>
          <div className="panel-title">Erreur de chargement</div>
          <div className="muted">
            {error.message ?? "Impossible de charger les donnees d'ouverture."}
          </div>
          <button className="btn-tertiary mt-4" onClick={onExit}>
            Retour au menu
          </button>
        </div>
      </div>
    );
  }

  if (mode === "scenario") {
    return (
      <div className="content">
        <div className="panel" style={{ marginTop: 32, textAlign: "center" }}>
          <div className="panel-title">Mode {mode}</div>
          <div className="muted">
            Ce mode sera actif une fois le guidage finalise.
          </div>
        </div>
      </div>
    );
  }

  const activeSession =
    mode === "guided"
      ? guidedSession
      : mode === "semi"
        ? semiSession
        : null;

  const hasScript =
    (mode === "guided" && guidedScript) || (mode === "semi" && semiScript);

  if (!activeSession || !hasScript) {
    return (
      <div className="content">
        <div className="panel" style={{ marginTop: 32, textAlign: "center" }}>
          <div className="panel-title">Contenu indisponible</div>
          <div className="muted">
            Ajoutez une sequence dans le fichier JSON de l'ouverture pour lancer cet entrainement.
          </div>
          <button className="btn-tertiary mt-4" onClick={onExit}>
            Retour au menu
          </button>
        </div>
      </div>
    );
  }

  const {
    position,
    boardOrientation,
    handleDrop,
    capturedPieces,
    materialAdvantage,
    analysis,
    coachMessage,
    playerMovesDone,
    playerMovesCount,
    completed,
    arePiecesDraggable,
    waitingOpponent,
    opponentProfile,
  } = activeSession;

  const sessionRunning = trainingActive;
  const dropHandler = sessionRunning ? handleDrop : () => false;
  const boardDraggable = sessionRunning ? arePiecesDraggable : false;
  const waitingFlag = sessionRunning ? waitingOpponent : false;

  const youLabel = messages.playerYou ?? "Vous";
  const coachLabel = "Coach";

  const whitePlayer = {
    label: boardOrientation === "white" ? youLabel : coachLabel,
    captured: capturedPieces?.w ?? [],
    advantage: materialAdvantage,
    active: boardOrientation === "white" && boardDraggable,
  };

  const blackPlayer = {
    label: boardOrientation === "black" ? youLabel : coachLabel,
    captured: capturedPieces?.b ?? [],
    advantage: materialAdvantage,
    active: boardOrientation === "black" && boardDraggable,
  };

  const totalTargets = playerMovesCount > 0 ? playerMovesCount : Math.max(playerMovesDone + 1, 1);
  const currentStep = Math.min(playerMovesDone + 1, totalTargets);
  const progressLabel = completed
    ? "Sequence terminee"
    : `Etape ${currentStep} / ${totalTargets}`;

  const opponentInfo = opponentProfile?.elo
    ? `IA: ${opponentProfile.elo}`
    : null;
  const coachDetail = coachMessage?.detail ?? null;
  const progressInfo = opponentInfo ? `${progressLabel} | ${opponentInfo}` : progressLabel;

  const idleStatus = canStartTraining
    ? "Pret : selectionnez un ELO puis cliquez sur Commencer."
    : "Sequence indisponible pour cette configuration.";

  const statusMessage = sessionRunning
    ? coachDetail ?? progressInfo
    : coachDetail ?? idleStatus;

  const hintMessage = sessionRunning
    ? waitingFlag
      ? "IA en reflexion..."
      : analysis.loading
        ? "Analyse du coach en cours..."
        : analysis.bestMove
          ? `${progressInfo} | Evaluation : ${formatScore(analysis.score)} | Coup suggere : ${analysis.bestMove.san}`
          : analysis.score !== null
            ? `${progressInfo} | Evaluation : ${formatScore(analysis.score)}`
            : progressInfo
    : "Session en pause. Lancez l exercice pour recevoir les conseils.";

  return (
    <BoardView
      position={position}
      onPieceDrop={dropHandler}
      boardOrientation={boardOrientation}
      arePiecesDraggable={boardDraggable}
      animationDuration={animationDuration}
      statusMessage={statusMessage}
      hintMessage={hintMessage}
      boardThemeColors={boardThemeConfig}
      topContent={
        <PlayerInfoPanel
          position="top"
          orientation={boardOrientation}
          white={whitePlayer}
          black={blackPlayer}
        />
      }
      bottomContent={
        <PlayerInfoPanel
          position="bottom"
          orientation={boardOrientation}
          white={whitePlayer}
          black={blackPlayer}
        />
      }
    />
  );
}
