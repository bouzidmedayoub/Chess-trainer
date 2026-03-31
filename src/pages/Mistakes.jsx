import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getMistakes, clearMistakes } from '../utils/mistakes';
import styles from './Mistakes.module.css';

export default function Mistakes() {
  const [mistakes, setMistakes] = useState(getMistakes());
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [game, setGame] = useState(null);
  const [message, setMessage] = useState(null); // { type, text }

  function loadMistake(index) {
    const mistake = mistakes[index];
    setSelectedIndex(index);
    setGame(new Chess(mistake.fen));
    setMessage({ type: 'prompt', text: '🎯 Find the correct move' });
  }

  function onPieceDrop(from, to) {
    if (game === null || selectedIndex === null) return false;

    const copy = new Chess(game.fen());
    const move = copy.move({ from, to, promotion: 'q' });

    if (!move) return false;

    const played = move.san.replace(/[+#?!]/g, '');
    const expected = mistakes[selectedIndex].expected;

    // Incorrect
    if (played !== expected) {
      setMessage({ type: 'incorrect', text: `✗ Wrong — try again` });
      return false;
    }

    // Correct — remove mistake
    const newMistakes = mistakes.filter((_, i) => i !== selectedIndex);
    localStorage.setItem('opening-mistakes', JSON.stringify(newMistakes));
    setMistakes(newMistakes);
    setSelectedIndex(null);
    setGame(null);
    setMessage({ type: 'correct', text: '✓ Correct! Mistake removed.' });

    return true;
  }

  const handleClear = () => {
    if (window.confirm('Clear all recorded mistakes? This cannot be undone.')) {
      clearMistakes();
      setMistakes([]);
      setGame(null);
      setSelectedIndex(null);
      setMessage(null);
    }
  };

  return (
    <div className={styles.mistakesPage}>
      <h1 className={styles.mistakesTitle}>🛠 Fix My Mistakes</h1>

      {mistakes.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🎉</span>
          No mistakes recorded — keep training!
        </div>
      ) : (
        <div className={styles.mistakesLayout}>
          {/* Mistake List */}
          <div className={styles.listPanel}>
            {mistakes.map((m, i) => (
              <div
                key={i}
                className={
                  selectedIndex === i
                    ? styles.mistakeCardActive
                    : styles.mistakeCard
                }
                onClick={() => loadMistake(i)}
              >
                <div className={styles.cardName}>{m.openingName}</div>
                <div className={styles.cardMeta}>
                  <span className={`badge ${m.side === 'white' ? 'badge-success' : 'badge-error'}`}>
                    {m.side}
                  </span>
                  <span>Expected: {m.expected}</span>
                </div>
              </div>
            ))}

            <button
              className={`btn ${styles.clearBtn}`}
              onClick={handleClear}
            >
              🗑 Clear All Mistakes
            </button>
          </div>

          {/* Board */}
          <div className={styles.boardPanel}>
            {game ? (
              <>
                <div className={styles.boardWrapper}>
                  <Chessboard
                    position={game.fen()}
                    onPieceDrop={onPieceDrop}
                    boardWidth={420}
                    boardOrientation={
                      mistakes[selectedIndex]?.side === 'black'
                        ? 'black'
                        : 'white'
                    }
                    animationDuration={200}
                    customBoardStyle={{ borderRadius: '4px' }}
                    customDarkSquareStyle={{ backgroundColor: '#779952' }}
                    customLightSquareStyle={{ backgroundColor: '#edeed1' }}
                  />
                </div>

                {message && (
                  <div
                    className={
                      message.type === 'correct'
                        ? styles.feedbackCorrect
                        : message.type === 'incorrect'
                          ? styles.feedbackIncorrect
                          : styles.feedbackPrompt
                    }
                  >
                    {message.text}
                  </div>
                )}
              </>
            ) : (
              <p className={styles.placeholder}>
                {message?.type === 'correct'
                  ? message.text
                  : '← Select a mistake to practice'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
