export default function OpeningCard({ opening, onSelect }) {
  const { name, slug, image } = opening;

  const handleCourseClick = () => {
    if (slug === "london-system") {
      onSelect({ type: "theory", slug: "london-system" });
    } else {
      alert("Cours détaillé disponible bientôt pour cette ouverture.");
    }
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-amber-800/30 hover:border-amber-500/40 hover:-translate-y-1 flex flex-col items-center p-4">
      <h3 className="text-xl font-bold text-amber-200/90 text-center pt-4 pb-3">
        {name}
      </h3>
      <div className="mb-4">
        <img
          src={image}
          alt={`Position clé pour ${name}`}
          className="rounded-lg shadow-md h-40 w-[280px] object-cover mx-auto"
        />
      </div>
      <div className="flex flex-col gap-3 w-[280px] px-4 pb-4 mx-auto">
        <button
          onClick={() => onSelect({ type: "trainer", slug, side: "white" })}
          className="card-btn card-btn-primary"
        >
          Apprendre l'ouverture
        </button>
        <button
          onClick={() => onSelect({ type: "trainer", slug, side: "black" })}
          className="card-btn card-btn-secondary"
        >
          Apprendre à contrer
        </button>
        <button onClick={handleCourseClick} className="card-btn card-btn-tertiary">
          Cours
        </button>
      </div>
    </div>
  );
}
