import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { fenToBoard } from "../utils/chess";
import Square from "./Square";

/**
 * Chessboard UI that renders an 8x8 grid from FEN.
 * Orientation is kept (default white at bottom). This is local play only.
 */
function ChessBoard({
  fen,
  orientation,
  selectedSquare,
  legalTargets,
  selectableSquares,
  lastMove,
  onSquareClick,
}) {
  const board = useMemo(() => fenToBoard(fen), [fen]);

  const legalTargetSet = useMemo(() => new Set(legalTargets), [legalTargets]);

  const lastFrom = lastMove?.from ?? null;
  const lastTo = lastMove?.to ?? null;

  const files = orientation === "w" ? "abcdefgh" : "hgfedcba";
  const ranks = orientation === "w" ? ["8", "7", "6", "5", "4", "3", "2", "1"] : ["1", "2", "3", "4", "5", "6", "7", "8"];

  return (
    <div className="BoardWrap" role="grid" aria-label="Chessboard">
      {ranks.map((rank) =>
        files.split("").map((file) => {
          const square = `${file}${rank}`;
          const piece = board.get(square) ?? null;
          const isLight = (file.charCodeAt(0) - 97 + parseInt(rank, 10)) % 2 === 0;

          const isSelected = selectedSquare === square;
          const isLegal = legalTargetSet.has(square);
          const isSelectable = selectableSquares?.has(square);
          const isLast = square === lastFrom || square === lastTo;

          return (
            <Square
              key={square}
              square={square}
              piece={piece}
              isLight={isLight}
              isSelected={isSelected}
              isLegal={isLegal}
              isLast={isLast}
              isSelectable={Boolean(isSelectable)}
              onClick={() => onSquareClick(square)}
            />
          );
        })
      )}
    </div>
  );
}

ChessBoard.propTypes = {
  fen: PropTypes.string.isRequired,
  orientation: PropTypes.oneOf(["w", "b"]),
  selectedSquare: PropTypes.string,
  legalTargets: PropTypes.arrayOf(PropTypes.string),
  selectableSquares: PropTypes.instanceOf(Set),
  lastMove: PropTypes.shape({
    from: PropTypes.string,
    to: PropTypes.string,
  }),
  onSquareClick: PropTypes.func.isRequired,
};

ChessBoard.defaultProps = {
  orientation: "w",
  selectedSquare: null,
  legalTargets: [],
  selectableSquares: new Set(),
  lastMove: null,
};

export default ChessBoard;
