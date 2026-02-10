import React from "react";
import PropTypes from "prop-types";

/**
 * Move history list, grouped by move number with white/black columns.
 */
function MoveHistory({ items, selectedPly, onSelectPly }) {
  return (
    <div>
      <h2 className="HistoryTitle">Move History</h2>

      {items.length === 0 ? (
        <p className="HistoryEmpty">No moves yet.</p>
      ) : (
        <ol className="HistoryList" aria-label="Move history list">
          {items.map((row) => {
            const isActive =
              selectedPly != null &&
              (selectedPly === row.whitePly || selectedPly === row.blackPly);

            return (
              <li
                key={row.moveNumber}
                className={[
                  "HistoryRow",
                  isActive ? "HistoryRow--active" : "",
                ].join(" ")}
              >
                <div className="HistoryMoveNo">{row.moveNumber}.</div>

                <button
                  type="button"
                  className="HistoryBtn"
                  onClick={() => onSelectPly(row.whitePly)}
                  disabled={row.white == null}
                  aria-label={`Preview after white move ${row.moveNumber}: ${row.white ?? ""}`}
                >
                  {row.white ?? "—"}
                </button>

                <button
                  type="button"
                  className="HistoryBtn"
                  onClick={() => onSelectPly(row.blackPly)}
                  disabled={row.black == null}
                  aria-label={`Preview after black move ${row.moveNumber}: ${row.black ?? ""}`}
                >
                  {row.black ?? "—"}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

MoveHistory.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      moveNumber: PropTypes.number.isRequired,
      white: PropTypes.string,
      black: PropTypes.string,
      whitePly: PropTypes.number,
      blackPly: PropTypes.number,
    })
  ).isRequired,
  selectedPly: PropTypes.number,
  onSelectPly: PropTypes.func.isRequired,
};

MoveHistory.defaultProps = {
  selectedPly: null,
};

export default MoveHistory;
