// libs/minimax.ts
import { Chess, Move as ChessMove } from "chess.js";

export interface AIMove {
  from: string;
  to: string;
  san?: string;
  promotion?: string;
  captured?: string;
  flags?: string;
}

export function getBestAIMoveFromFen(
  fen: string,
  depth: number = 2,
): AIMove | null {
  const game = new Chess(fen);
  let bestMove: string | null = null;
  let bestValue = -Infinity;

  for (const m of game.moves()) {
    game.move(m);
    const val = minimax(game, depth - 1, -Infinity, Infinity, false);
    game.undo();
    if (val > bestValue) {
      bestValue = val;
      bestMove = m;
    }
  }

  if (!bestMove) return null;

  const verbose = game.moves({ verbose: true }) as ChessMove[];
  const found = verbose.find(
    (mv) =>
      // compare SAN or UCI/lans
      mv.san === bestMove ||
      mv.lan === bestMove ||
      mv.from + mv.to === bestMove,
  );
  if (!found) return null;

  const { from, to, san, promotion, captured, flags } = found;
  return { from, to, san, promotion, captured, flags };
}

function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves();
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      game.move(m);
      const evalValue = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalValue);
      alpha = Math.max(alpha, evalValue);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      game.move(m);
      const evalValue = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalValue);
      beta = Math.min(beta, evalValue);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function evaluateBoard(game: Chess): number {
  const board = game.board();
  const pieceValues: Record<string, number> = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
  };
  let score = 0;
  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      const val = pieceValues[piece.type] || 0;
      score += piece.color === "w" ? val : -val;
    }
  }
  return score;
}
