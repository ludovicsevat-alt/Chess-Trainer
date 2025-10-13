import { Chessboard } from "react-chessboard";

export default function ChessBoardUI() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0d1117] text-gray-100">
      <div className="flex flex-col md:flex-row gap-6 p-6 bg-[#1a1e24] rounded-2xl shadow-lg">
        
        {/* Zone gauche : échiquier */}
        <div className="flex flex-col items-center">
          <div className="p-3 bg-[#232a33] rounded-xl shadow-md">
            {/* 🔧 Taille adaptative du plateau */}
            <div style={{ width: "min(80vw, 420px)" }}>
              <Chessboard
                id="CustomBoard"
                customDarkSquareStyle={{ backgroundColor: "#283540" }}
                customLightSquareStyle={{ backgroundColor: "#d9d9d9" }}
                arePiecesDraggable={true}
              />
            </div>
          </div>

          {/* Boutons sous le plateau */}
          <div className="flex gap-3 mt-4 flex-wrap justify-center">
            <button className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition">
              Nouvelle partie
            </button>
            <button className="bg-[#2b3340] px-4 py-2 rounded-md border border-gray-600">
              Couleur : Blancs
            </button>
            <button className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-500 transition">
              IA
            </button>
          </div>
        </div>

        {/* Zone droite : menu latéral */}
        <div className="flex flex-col justify-center gap-4 text-left">
          <h2 className="text-xl font-semibold text-gray-200">Jouer aux échecs</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">⚡ <span>Jouer en ligne</span></li>
            <li className="flex items-center gap-2">🤖 <span>Jouer contre l’IA</span></li>
            <li className="flex items-center gap-2">👥 <span>Jouer avec un ami</span></li>
            <li className="flex items-center gap-2">🏆 <span>Variantes d’échecs</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

