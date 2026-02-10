import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { promotionPieceOptions } from "../utils/chess";

/**
 * Modal dialog for pawn promotion selection.
 */
function PromotionDialog({ open, color, onSelect, onClose }) {
  const firstBtnRef = useRef(null);

  useEffect(() => {
    if (open && firstBtnRef.current) firstBtnRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const options = promotionPieceOptions(color);

  return (
    <div className="DialogBackdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="DialogCard"
        role="dialog"
        aria-modal="true"
        aria-label="Promotion selection"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="DialogTitle">Pawn Promotion</h3>
        <p className="DialogText">Choose a piece to promote to (default is Queen).</p>

        <div className="PromoGrid" role="group" aria-label="Promotion options">
          {options.map((opt, idx) => (
            <button
              key={opt.piece}
              type="button"
              className="PromoBtn"
              onClick={() => onSelect(opt.piece)}
              ref={idx === 0 ? firstBtnRef : null}
              aria-label={`Promote to ${opt.label}`}
            >
              <span className="PromoPiece" aria-hidden="true">
                {opt.glyph}
              </span>
              <span className="PromoLabel">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

PromotionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  color: PropTypes.oneOf(["w", "b"]).isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PromotionDialog;
