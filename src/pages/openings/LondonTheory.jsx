import { useSettings } from "../../contexts/SettingsContext";

export default function LondonTheory() {
  const { messages } = useSettings();

  const theoryContent = {
    title: messages.londonTheoryTitle || "Système de Londres — Théorie",
    image: "/assets/images/ouvertures/LondonTheory.jpg",
    sections: [
      {
        heading: messages.londonTheoryObjectiveHeading || "Objectif de l'ouverture",
        text:
          messages.londonTheoryObjectiveText ||
          "Le Système de Londres est une ouverture de flanc caractérisée par le coup 1.d4 suivi de 2.Bf4 (ou 2.Nf3 puis 3.Bf4). Son objectif principal est de développer rapidement les pièces, de contrôler le centre sans s'engager trop tôt et de créer une structure de pions solide. Les Blancs visent souvent à établir un pion sur e3 et c3, formant un « triangle » de pions au centre, tout en développant le fou de cases blanches en dehors de la chaîne de pions.",
      },
      {
        heading: messages.londonTheorySetupHeading || "Mise en place typique",
        text:
          messages.londonTheorySetupText ||
          "La structure de pions typique implique des pions sur d4, e3 et c3. Les pièces sont développées de manière harmonieuse : le fou de cases blanches en f4, un cavalier en f3, l'autre en d2 (ou c3), et un roque rapide à l'aile roi. Le plan est souvent de se préparer à une attaque sur l'aile roi ou de profiter d'une position solide pour manœuvrer.",
      },
      {
        heading: messages.londonTheoryVariationsHeading || "Variantes courantes",
        text:
          messages.londonTheoryVariationsText ||
          "Les variantes courantes incluent des lignes avec ...c5, ...e6 ou ...g6. Les Noirs tentent de briser le centre des Blancs ou de créer du contre-jeu sur les ailes. Les Blancs doivent être prêts à s'adapter aux différentes réponses tout en maintenant leur structure.",
      },
      {
        heading: messages.londonTheoryStrengthsWeaknessesHeading || "Forces et faiblesses",
        text:
          messages.londonTheoryStrengthsWeaknessesText ||
          "Forces : solide, facile à apprendre, flexible, permet d'éviter les lignes théoriques complexes. Faiblesses : peut devenir trop passif si les Blancs ne sont pas proactifs ; les Noirs peuvent égaliser confortablement avec un jeu précis.",
      },
      {
        heading: messages.londonTheoryTipsHeading || "Conseils pour débuter",
        text:
          messages.londonTheoryTipsText ||
          "Concentrez-vous sur un développement harmonieux, la sécurité du roi et la compréhension des plans à long terme. N'hésitez pas à échanger des pièces si cela renforce votre position. Soyez patient et recherchez les opportunités d'attaque.",
      },
      {
        heading: messages.londonTheoryExampleHeading || "Exemple de position",
        text:
          messages.londonTheoryExampleText ||
          "Après 1.d4 d5 2.Bf4 Nf6 3.e3 e6 4.Nf3 c5 5.c3 Nc6 6.Nbd2 Bd6 7.Bg3 O-O 8.Bd3, les Blancs disposent d'une position solide et sont prêts à développer leur attaque.",
      },
    ],
  };

  return (
    <div className="content-container p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-amber-300/90 text-center mb-8">
        {theoryContent.title}
      </h1>
      <div className="flex justify-center mb-8">
        <img
          src={theoryContent.image}
          alt={theoryContent.title}
          className="rounded-lg shadow-md max-w-full h-auto"
          style={{ maxWidth: "600px" }}
        />
      </div>
      {theoryContent.sections.map((section, index) => (
        <div key={index} className="mb-6">
          <h2 className="text-2xl font-semibold text-amber-200/90 mb-3">
            {section.heading}
          </h2>
          <p className="text-gray-300 leading-relaxed">{section.text}</p>
        </div>
      ))}
    </div>
  );
}
