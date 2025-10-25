import { Chessboard } from "react-chessboard";

export default function StaticBoard({ position }) {
  return (
    <div className="content">
      <div className="board-wrap">
        <Chessboard position={position} arePiecesDraggable={false} />
      </div>
    </div>
  );
}
