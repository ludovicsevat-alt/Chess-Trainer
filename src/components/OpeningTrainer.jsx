export default function OpeningTrainer({ selection, onExit }) {
  const { openingSlug, side } = selection;

  return (
    <div className="text-white text-center p-8">
      <h1 className="text-3xl font-bold">Entraînement à l'ouverture</h1>
      <p className="mt-4 text-xl">
        Ouverture : <span className="font-mono">{openingSlug}</span>
      </p>
      <p className="text-xl">
        Côté : <span className="font-mono">{side}</span>
      </p>
      <p className="mt-8 text-gray-400">Le module d'entraînement interactif sera affiché ici.</p>
      <button onClick={onExit} className="btn-secondary mt-8">
        Retour au menu
      </button>
    </div>
  );
}
