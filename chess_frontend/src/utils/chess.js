/**
 * Utility helpers for chess.js integration and UI formatting.
 */

const PIECE_UNICODE = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};

const PIECE_NAMES = {
  k: "King",
  q: "Queen",
  r: "Rook",
  b: "Bishop",
  n: "Knight",
  p: "Pawn",
};

// PUBLIC_INTERFACE
export function pieceToUnicode(piece) {
  /** Convert chess.js piece object to a unicode glyph + metadata. */
  if (!piece) return "";
  return PIECE_UNICODE[piece.color]?.[piece.type] ?? "";
}

// PUBLIC_INTERFACE
export function fenToBoard(fen) {
  /**
   * Converts FEN into a Map(square -> pieceInfo).
   * pieceInfo includes type/color/name for UI.
   */
  const placement = fen.split(" ")[0];
  const rows = placement.split("/");
  const map = new Map();

  for (let r = 0; r < 8; r++) {
    const rank = 8 - r;
    let fileIndex = 0;
    for (const ch of rows[r]) {
      if (/\d/.test(ch)) {
        fileIndex += parseInt(ch, 10);
        continue;
      }
      const color = ch === ch.toUpperCase() ? "w" : "b";
      const type = ch.toLowerCase();
      const file = "abcdefgh"[fileIndex];
      const square = `${file}${rank}`;
      map.set(square, {
        color,
        type,
        name: PIECE_NAMES[type] ?? "Piece",
      });
      fileIndex += 1;
    }
  }
  return map;
}

// PUBLIC_INTERFACE
export function computeGameStatus(game) {
  /**
   * Compute a user-friendly status string for current game state.
   */
  const isCheck = game.inCheck();
  const isMate = game.isCheckmate();
  const isStalemate = game.isStalemate();
  const isDraw =
    game.isDraw() ||
    game.isInsufficientMaterial() ||
    game.isThreefoldRepetition();

  let text = "In progress";
  if (isMate) text = "Checkmate";
  else if (isStalemate) text = "Stalemate";
  else if (isDraw) text = "Draw";
  else if (isCheck) text = "Check";

  return { text, isCheck, isMate, isStalemate, isDraw, isGameOver: game.isGameOver() };
}

// PUBLIC_INTERFACE
export function buildHistoryFromVerboseMoves(verboseMoves) {
  /**
   * Convert chess.js verbose history into rows: {moveNumber, white, black, whitePly, blackPly}
   * selectedPly refers to number of half-moves applied.
   */
  const rows = [];
  for (let i = 0; i < verboseMoves.length; i += 2) {
    const moveNumber = i / 2 + 1;
    const w = verboseMoves[i];
    const b = verboseMoves[i + 1];

    rows.push({
      moveNumber,
      white: w?.san ?? null,
      black: b?.san ?? null,
      whitePly: w ? i + 1 : null,
      blackPly: b ? i + 2 : null,
    });
  }
  return rows;
}

// PUBLIC_INTERFACE
export function promotionPieceOptions(color) {
  /**
   * Promotion options for UI. Returns pieces in standard order.
   */
  const c = color === "w" ? "w" : "b";
  return [
    { piece: "q", label: "Queen", glyph: PIECE_UNICODE[c].q },
    { piece: "r", label: "Rook", glyph: PIECE_UNICODE[c].r },
    { piece: "b", label: "Bishop", glyph: PIECE_UNICODE[c].b },
    { piece: "n", label: "Knight", glyph: PIECE_UNICODE[c].n },
  ];
}
