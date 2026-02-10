import React from "react";
import PropTypes from "prop-types";

/**
 * Displays the side to move and current status (check/checkmate/stalemate/etc).
 */
function TurnIndicator({ turn, statusText, isPreview }) {
  const isWhite = turn === "w";
  const label = isWhite ? "White" : "Black";

  return (
    <div className="TurnCard" aria-label="Turn indicator">
      <div className="TurnBadge">
        <span
          className={["TurnPip", isWhite ? "" : "TurnPip--black"].join(" ")}
          aria-hidden="true"
        />
        <span>
          Turn: <span style={{ color: isWhite ? "var(--accent-primary)" : "var(--accent-success)" }}>{label}</span>
        </span>
      </div>

      <div className="TurnMeta" aria-label="Game status">
        {isPreview ? "Preview" : "Live"} · {statusText}
      </div>
    </div>
  );
}

TurnIndicator.propTypes = {
  turn: PropTypes.oneOf(["w", "b"]).isRequired,
  statusText: PropTypes.string.isRequired,
  isPreview: PropTypes.bool,
};

TurnIndicator.defaultProps = {
  isPreview: false,
};

export default TurnIndicator;
