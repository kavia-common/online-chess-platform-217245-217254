import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import "./App.css";

import ChessBoard from "./components/ChessBoard";
import MoveHistory from "./components/MoveHistory";
import TurnIndicator from "./components/TurnIndicator";
import PromotionDialog from "./components/PromotionDialog";
import Controls from "./components/Controls";

import { buildHistoryFromVerboseMoves, computeGameStatus } from "./utils/chess";

/**
 * Creates a new chess.js instance with standard initial position.
 */
function createNewGame() {
  return new Chess();
}

// PUBLIC_INTERFACE
function App() {
  /** Keep a stable chess instance; we call .fen() changes to trigger renders. */
  const gameRef = useRef(createNewGame());

  const [fen, setFen] = useState(gameRef.current.fen());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [previewPly, setPreviewPly] = useState(null);

  const game = gameRef.current;

  const historyVerbose = useMemo(() => game.history({ verbose: true }), [fen]);
  const historyItems = useMemo(
    () => buildHistoryFromVerboseMoves(historyVerbose),
    [historyVerbose]
  );

  const turn = game.turn(); // 'w' | 'b'
  const status = useMemo(() => computeGameStatus(game), [fen]);

  const previewGame = useMemo(() => {
    if (previewPly == null) return null;
    const g = createNewGame();
    // Apply first N half-moves
    const moves = historyVerbose.slice(0, previewPly);
    for (const mv of moves) {
      g.move({ from: mv.from, to: mv.to, promotion: mv.promotion });
    }
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewPly, fen]);

  const displayedGame = previewGame ?? game;
  const displayedFen = displayedGame.fen();

  const legalTargets = useMemo(() => {
    if (pendingPromotion || previewGame) return [];
    if (!selectedSquare) return [];

    const moves = game.moves({ square: selectedSquare, verbose: true });
    return moves.map((m) => m.to);
  }, [game, fen, selectedSquare, pendingPromotion, previewGame]);

  const selectableSquares = useMemo(() => {
    if (pendingPromotion || previewGame) return new Set();
    const set = new Set();
    const board = game.board();
    // board is 8x8 array with pieces or null
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        const piece = board[r][c];
        if (!piece) continue;
        if (piece.color !== turn) continue;
        const file = "abcdefgh"[c];
        const rank = String(8 - r);
        const sq = `${file}${rank}`;
        if (game.moves({ square: sq }).length > 0) set.add(sq);
      }
    }
    return set;
  }, [game, fen, turn, pendingPromotion, previewGame]);

  const commitRender = useCallback(() => {
    setFen(game.fen());
  }, [game]);

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
  }, []);

  const resetPreviewIfNeeded = useCallback(() => {
    if (previewPly != null) setPreviewPly(null);
  }, [previewPly]);

  const handleNewGame = useCallback(() => {
    gameRef.current = createNewGame();
    setSelectedSquare(null);
    setPendingPromotion(null);
    setPreviewPly(null);
    setFen(gameRef.current.fen());
  }, []);

  const openPromotionIfNeeded = useCallback(
    ({ from, to }) => {
      // Promotion happens when a pawn moves to last rank.
      const piece = game.get(from);
      if (!piece || piece.type !== "p") return false;
      const toRank = to[1];
      const isPromotion =
        (piece.color === "w" && toRank === "8") ||
        (piece.color === "b" && toRank === "1");
      if (!isPromotion) return false;

      setPendingPromotion({ from, to, color: piece.color });
      return true;
    },
    [game]
  );

  const tryMove = useCallback(
    ({ from, to, promotion }) => {
      resetPreviewIfNeeded();

      // If a promotion is needed and promotion piece not provided, open dialog.
      if (!promotion) {
        const opened = openPromotionIfNeeded({ from, to });
        if (opened) return { ok: true, needsPromotion: true };
      }

      const move = game.move({ from, to, promotion });
      if (!move) return { ok: false };

      setSelectedSquare(null);
      setPendingPromotion(null);
      commitRender();
      return { ok: true };
    },
    [commitRender, game, openPromotionIfNeeded, resetPreviewIfNeeded]
  );

  const onSquareClick = useCallback(
    (square) => {
      if (pendingPromotion) return;
      if (previewGame) return;

      const piece = game.get(square);

      if (!selectedSquare) {
        // Select only current player's pieces that have legal moves
        if (piece && piece.color === turn && selectableSquares.has(square)) {
          setSelectedSquare(square);
        }
        return;
      }

      // Clicking same square clears selection
      if (square === selectedSquare) {
        clearSelection();
        return;
      }

      // If clicking another own piece, switch selection
      if (piece && piece.color === turn && selectableSquares.has(square)) {
        setSelectedSquare(square);
        return;
      }

      // Otherwise attempt move
      const res = tryMove({ from: selectedSquare, to: square });
      if (!res.ok) {
        // Keep selection; user might click again.
      }
    },
    [
      pendingPromotion,
      previewGame,
      game,
      selectedSquare,
      turn,
      selectableSquares,
      tryMove,
      clearSelection,
    ]
  );

  const onPromotionSelect = useCallback(
    (piece) => {
      if (!pendingPromotion) return;

      // If user closes without choosing, default to queen (per requirements).
      const promotion = piece ?? "q";
      tryMove({
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion,
      });
    },
    [pendingPromotion, tryMove]
  );

  const onPromotionClose = useCallback(() => {
    // Default to queen if not chosen, per requirements.
    onPromotionSelect("q");
  }, [onPromotionSelect]);

  const onHistorySelect = useCallback((ply) => {
    setSelectedSquare(null);
    setPendingPromotion(null);
    setPreviewPly(ply);
  }, []);

  useEffect(() => {
    // If game ended, clear selection to avoid confusing highlights.
    if (status.isGameOver) setSelectedSquare(null);
  }, [status.isGameOver]);

  return (
    <div className="RetroApp">
      <div className="RetroShell">
        <header className="RetroHeader">
          <div className="RetroHeader__left">
            <h1 className="RetroTitle">Retro Chess</h1>
            <p className="RetroSubtitle">Local two‑player • legal moves only</p>
          </div>

          <div className="RetroHeader__right">
            <TurnIndicator
              turn={displayedGame.turn()}
              statusText={previewGame ? "Previewing history" : status.text}
              isPreview={Boolean(previewGame)}
            />
          </div>
        </header>

        <main className="RetroMain" aria-label="Chess game area">
          <section className="RetroBoardPane" aria-label="Chessboard section">
            <div className="RetroBoardCard">
              <ChessBoard
                fen={displayedFen}
                orientation="w"
                selectedSquare={previewGame ? null : selectedSquare}
                legalTargets={previewGame ? [] : legalTargets}
                selectableSquares={previewGame ? new Set() : selectableSquares}
                lastMove={
                  displayedGame.history({ verbose: true }).slice(-1)[0] ?? null
                }
                onSquareClick={onSquareClick}
              />

              <div className="RetroStatusRow" role="status" aria-live="polite">
                <span className="RetroStatusLabel">Status:</span>{" "}
                <span className="RetroStatusText">
                  {previewGame ? "Preview mode — click a move to return" : status.text}
                </span>
              </div>

              <Controls
                onNewGame={handleNewGame}
                onExitPreview={() => setPreviewPly(null)}
                isPreview={Boolean(previewGame)}
              />
            </div>
          </section>

          <aside className="RetroHistoryPane" aria-label="Move history">
            <MoveHistory
              items={historyItems}
              selectedPly={previewPly}
              onSelectPly={onHistorySelect}
            />
          </aside>
        </main>

        <footer className="RetroFooter">
          Tip: Click a piece to see legal moves. Use Tab/Enter for keyboard play.
        </footer>
      </div>

      <PromotionDialog
        open={Boolean(pendingPromotion)}
        color={pendingPromotion?.color ?? "w"}
        onSelect={onPromotionSelect}
        onClose={onPromotionClose}
      />
    </div>
  );
}

export default App;
