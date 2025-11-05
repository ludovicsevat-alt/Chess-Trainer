import { Chess } from 'chess.js';

const parser = new Chess();
const moves = [
    'd4', 'd5', 'Nc3', 'Nf6', 'Bf4', 'Nc6', 'Nb5', 'e5', 'Bxe5', 'Nxe5',
    'dxe5', 'Ne4', 'Qxd5', 'Qxd5', 'Nxc7+', 'Kd7', 'Nxd5'
];

for (let i = 0; i < moves.length; i++) {
    const san_move = moves[i];
    try {
        const move = parser.move(san_move);
        console.log(`Move ${i+1}: ${san_move}, FEN: ${parser.fen()}`);
    } catch (e) {
        console.error(`Error at move ${i+1}: ${san_move}, Error: ${e.message}`);
        break;
    }
}
