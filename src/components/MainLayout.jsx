import { Chessboard } from "react-chessboard";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import PlayLocal from "../pages/PlayLocal";
import PlayVsAI from "../pages/PlayVsAI";

export default function MainLayout() {
  const hoverSound = useRef(null);
  const scrollSound = useRef(null);
  const [activePage, setActivePage] = useState("home");
  const [fadeOut, setFadeOut] = useState(false);

  const basePath =
    import.meta.env.MODE === "production" ? "/Chess-Trainer" : "";

  const playHoverSound = () => {
    const snd = hoverSound.current;
    if (snd) {
      snd.currentTime = 0;
      snd.play().catch(() => {});
    }
  };

  const switchPage = (target) => {
    const snd = scrollSound.current;
    if (snd) {
      snd.currentTime = 0;
      snd.play().catch(() => {});
    }
    setFadeOut(true);
    setTimeout(() => {
      setActivePage(target);
      setFadeOut(false);
    }, 700);
  };

  return (
    <div
      className={`flex min-h-screen bg-[#0d1117] text-gray-100 overflow-hidden font-[Cinzel] transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <audio
        ref={hoverSound}
        src={`${basePath}/assets/sounds/hover.mp3`}
        preload="auto"
      />
      <audio
        ref={scrollSound}
        src={`${basePath}/assets/sounds/scroll.mp3`}
        preload="auto"
      />

      {/* MENU GAUCHE */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-[280px] bg-[#161b22] p-5 flex flex-col justify-between border-r border-gray-800"
      >
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center mb-6 animate-shine-slow"
          >
            <img
              src={`${basePath}/assets/images/titre.png`}
              alt="Chess Trainer"
              className="w-full max-w-[260px] object-contain select-none pointer-events-none"
            />
          </motion.div>

          <ul className="space-y-4 text-lg tracking-wide">
            {[
              { symbol: "♜", text: "Accueil", action: "home" },
              { symbol: "♞", text: "Ouvertures" },
              { symbol: "♛", text: "Entraînement" },
              { symbol: "♝", text: "Statistiques" },
              { symbol: "⚙", text: "Paramètres" },
            ].map((item, i) => (
              <motion.li
                key={i}
                onMouseEnter={playHoverSound}
                onClick={() => switchPage(item.action || "home")}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <span className="text-yellow-600 text-xl w-6 text-center group-hover:shine">
                  {item.symbol}
                </span>
                <span className="ml-[2px] group-hover:shine">{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">v2.0 — Dev Mode</p>
      </motion.aside>

      {/* CONTENU CENTRAL */}
      <motion.main
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex-1 flex justify-center items-center"
      >
        {activePage === "home" ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
            className="flex justify-center items-center w-full h-screen"
          >
            <div className="h-[90vh] aspect-square rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] relative">
              <Chessboard
                id="MainBoard"
                customDarkSquareStyle={{ backgroundColor: "#3a4a55" }}
                customLightSquareStyle={{ backgroundColor: "#e0d7b6" }}
                arePiecesDraggable={false}
              />
            </div>
          </motion.div>
        ) : activePage === "ai" ? (
          <PlayVsAI onBack={() => switchPage("home")} />
        ) : (
          <PlayLocal onBack={() => switchPage("home")} />
        )}
      </motion.main>

      {/* MENU DROIT */}
      <motion.aside
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-[280px] bg-[#161b22] p-10 border-l border-gray-800 flex flex-col justify-start"
      >
        <h2 className="text-2xl font-semibold mb-8 text-gray-200 text-center">
          Jouer aux échecs
        </h2>
        <ul className="space-y-5 text-lg">
          {[
            { symbol: "⚔", text: "Jouer en ligne" },
            { symbol: "♟", text: "Jouer contre l’IA", action: "ai" },
            { symbol: "⚜", text: "Jouer avec un ami", action: "local" },
            { symbol: "👑", text: "Variantes d’échecs" },
          ].map((item, i) => (
            <motion.li
              key={i}
              onMouseEnter={playHoverSound}
              onClick={() => switchPage(item.action || "home")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <span className="text-yellow-600 text-xl w-6 text-center group-hover:shine">
                {item.symbol}
              </span>
              <span className="ml-[2px] group-hover:shine">{item.text}</span>
            </motion.li>
          ))}
        </ul>
      </motion.aside>
    </div>
  );
}
