import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { pieceToUnicode } from "../utils/chess";

/**
 * Single chess square as a button for accessibility and keyboard interaction.
 */
function Square({
  square,
  piece,
  isLight,
  isSelected,
  isLegal,
  isLast,
  isSelectable,
  onClick,
}) {
  const labelPiece = piece
    ? `${piece.color === "w" ? "White" : "Black"} ${piece.name}`
    : "Empty";

  const ariaLabel = `${square}. ${labelPiece}.`;

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  const className = [
    "Square",
    isLight ? "Square--light" : "Square--dark",
    isSelected ? "Square--selected" : "",
    isLegal ? "Square--legal" : "",
    isLast ? "Square--last" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Keep squares always focusable for keyboard navigation.
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      data-square={square}
    >
      <span className="Square__overlay" aria-hidden="true" />
      {isLegal ? <span className="Square__dot" aria-hidden="true" /> : null}
      <span aria-hidden="true">{piece ? pieceToUnicode(piece) : ""}</span>

      {/* Simple coordinate hints for retro feel */}
      {square[0] === "a" ? (
        <span className="Square__coords" aria-hidden="true">
          {square[1]}
        </span>
      ) : null}
      {square[1] === "1" ? (
        <span className="Square__coords Square__file" aria-hidden="true">
          {square[0]}
        </span>
      ) : null}

      {/* Assistive hint: squares with selectable pieces */}
      {isSelectable ? (
        <span className="sr-only">Selectable piece</span>
      ) : null}
    </button>
  );
}

Square.propTypes = {
  square: PropTypes.string.isRequired,
  piece: PropTypes.shape({
    type: PropTypes.string.isRequired,
    color: PropTypes.oneOf(["w", "b"]).isRequired,
    name: PropTypes.string.isRequired,
  }),
  isLight: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool,
  isLegal: PropTypes.bool,
  isLast: PropTypes.bool,
  isSelectable: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

Square.defaultProps = {
  piece: null,
  isSelected: false,
  isLegal: false,
  isLast: false,
  isSelectable: false,
};

export default Square;
