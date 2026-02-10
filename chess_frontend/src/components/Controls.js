import React from "react";
import PropTypes from "prop-types";

/**
 * Game controls: restart and preview exit.
 */
function Controls({ onNewGame, isPreview, onExitPreview }) {
  return (
    <div className="RetroBtnRow" aria-label="Game controls">
      <button
        type="button"
        className="RetroBtn RetroBtn--primary"
        onClick={onNewGame}
        aria-label="Restart game"
      >
        New Game
      </button>

      {isPreview ? (
        <button
          type="button"
          className="RetroBtn RetroBtn--ghost"
          onClick={onExitPreview}
          aria-label="Exit preview mode"
        >
          Exit Preview
        </button>
      ) : null}
    </div>
  );
}

Controls.propTypes = {
  onNewGame: PropTypes.func.isRequired,
  isPreview: PropTypes.bool,
  onExitPreview: PropTypes.func.isRequired,
};

Controls.defaultProps = {
  isPreview: false,
};

export default Controls;
