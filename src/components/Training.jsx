import OpeningCard from "./OpeningCard";
import CardGrid from "./CardGrid";

const openings = [
  {
    name: "Système de Londres",
    slug: "london-system",
    image: "/assets/images/ouvertures/default.jpg",
  },
  {
    name: "Défense Sicilienne",
    slug: "sicilian-defense",
    image: "/assets/images/ouvertures/default.jpg",
  },
  {
    name: "Gambit de la Dame",
    slug: "queens-gambit",
    image: "/assets/images/ouvertures/default.jpg",
  },
];

export default function Training({ onSelect }) {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-amber-300/90 text-center mb-8">
        Choisissez une ouverture
      </h1>
      <CardGrid
        items={openings}
        renderItem={(op) => (
          <OpeningCard key={op.slug} opening={op} onSelect={onSelect} />
        )}
      />
    </div>
  );
}

