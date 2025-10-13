import { useState, useEffect } from "react";
//import { StockfishEngine } from "@/engine/engine.js";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

export default function ChessBoard({ settings }) {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());

  function onDrop(sourceSquare, targetSquare) {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;
    setFen(game.fen());
    return true;
  }
useEffect(() => {
  async function start() {
    const engine = await initStockfish();
    engine.postMessage("isready");
  }
  start();
}, []);
  return (
    <div className="flex flex-col items-center">
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardOrientation={settings.playerColor}
        boardWidth={500}
      />
    </div>
  );
}
