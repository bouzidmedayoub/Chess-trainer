import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getAllOpenings } from '../data/openingsData';
import { saveMistake } from '../utils/mistakes';
import { recordAttempt, recordSession } from '../utils/statsManager';
import useSettings, { BOARD_THEMES } from '../utils/useSettings';
import EvalBar from '../components/EvalBar';
import MoveList from '../components/MoveList';
import TrainerControls from '../components/TrainerControls';
import styles from './OpeningTrainer.module.css';

const allOpenings = getAllOpenings();

/**
 * Simple static evaluation based on material count.
 * Used for the eval bar visualization.
 */
function evaluatePosition(fen) {
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    const parts = fen.split(' ');
    const board = parts[0];
    let score = 0;

    for (const ch of board) {
        const lower = ch.toLowerCase();
        if (pieceValues[lower] !== undefined) {
            score += ch === lower ? -pieceValues[lower] : pieceValues[lower];
        }
    }
    return score;
}

export default function OpeningTrainer() {
    // ── Settings ──
    const { settings } = useSettings();
    const { timerEnabled, timerDuration, autoAdvance, showHints, boardTheme } = settings;
    const theme = BOARD_THEMES[boardTheme] || BOARD_THEMES.green;

    // ── Opening state ──
    const [openingIndex, setOpeningIndex] = useState(0);
    const [game, setGame] = useState(new Chess());
    const [moveIndex, setMoveIndex] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [flipped, setFlipped] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type, message }
    const [boardAnim, setBoardAnim] = useState('');
    const [correctInLine, setCorrectInLine] = useState(0);
    const [totalInLine, setTotalInLine] = useState(0);

    // ── Timer state ──
    const [timeLeft, setTimeLeft] = useState(timerDuration);
    const timerRef = useRef(null);
    const isPlayerTurnRef = useRef(false);

    const opening = allOpenings[openingIndex];
    const moves = opening?.moves || [];
    const playerSide = opening?.side || 'white';

    // Auto-set board orientation based on side
    useEffect(() => {
        setFlipped(playerSide === 'black');
    }, [playerSide]);

    // ── Timer logic ──
    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        clearTimer();
        setTimeLeft(timerDuration);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [timerDuration, clearTimer]);

    // Handle timeout
    useEffect(() => {
        if (!timerEnabled || !isPlayerTurnRef.current || completed) return;
        if (timeLeft === 0) {
            const current = moves[moveIndex];
            const expected = playerSide === 'white' ? current?.white : current?.black;

            if (expected && current) {
                recordAttempt(opening.id, opening.name, false);
                saveMistake({
                    openingId: opening.id,
                    openingName: opening.name,
                    side: playerSide,
                    reason: 'timeout',
                    fen: game.fen(),
                    expected,
                    timestamp: Date.now(),
                });
                setTotalInLine((t) => t + 1);
                setFeedback({ type: 'incorrect', message: `⏱ Time's up! Expected ${expected}` });
                setBoardAnim('incorrect');
                setTimeout(() => setBoardAnim(''), 600);
            }
        }
    }, [timeLeft]);

    // Start/stop timer based on whether it's the player's turn
    useEffect(() => {
        if (!timerEnabled || completed || moves.length === 0) {
            clearTimer();
            return;
        }

        const turn = game.turn(); // 'w' or 'b'
        const isPlayer =
            (playerSide === 'white' && turn === 'w') ||
            (playerSide === 'black' && turn === 'b');
        isPlayerTurnRef.current = isPlayer;

        if (isPlayer && moveIndex < moves.length) {
            startTimer();
        } else {
            clearTimer();
        }

        return clearTimer;
    }, [game, moveIndex, completed, timerEnabled, playerSide, startTimer, clearTimer, moves.length]);

    // ── Reset when opening changes ──
    const resetOpening = useCallback((index) => {
        clearTimer();
        setOpeningIndex(index);
        setGame(new Chess());
        setMoveIndex(0);
        setCompleted(false);
        setFeedback(null);
        setBoardAnim('');
        setCorrectInLine(0);
        setTotalInLine(0);
        setTimeLeft(timerDuration);
    }, [clearTimer, timerDuration]);

    // For black side: auto-play white's first move
    useEffect(() => {
        if (playerSide === 'black' && moveIndex === 0 && moves.length > 0) {
            const firstWhiteMove = moves[0]?.white;
            if (firstWhiteMove) {
                setTimeout(() => {
                    const g = new Chess(game.fen());
                    try {
                        g.move(firstWhiteMove);
                        setGame(new Chess(g.fen()));
                    } catch (e) {
                        // move failed
                    }
                }, 400);
            }
        }
    }, [openingIndex]);

    // ── Completion detection + auto-advance ──
    useEffect(() => {
        if (moveIndex >= moves.length && moves.length > 0 && !completed) {
            setCompleted(true);
            clearTimer();
            setFeedback({ type: 'complete', message: '🎉 Opening completed! Well done.' });

            if (totalInLine > 0) {
                const acc = Math.round((correctInLine / totalInLine) * 100);
                recordSession(opening.id, opening.name, acc);
            }

            // Auto-advance to next opening if enabled
            if (autoAdvance && openingIndex < allOpenings.length - 1) {
                setTimeout(() => {
                    resetOpening(openingIndex + 1);
                }, 2000);
            }
        }
    }, [moveIndex, completed, moves.length]);

    // ── Handle piece drop ──
    function onPieceDrop(from, to) {
        const turn = game.turn();
        const isPlayerTurn =
            (playerSide === 'white' && turn === 'w') ||
            (playerSide === 'black' && turn === 'b');

        if (!isPlayerTurn || completed) return false;

        const before = new Chess(game.fen());
        const copy = new Chess(game.fen());

        const move = copy.move({ from, to, promotion: 'q' });
        if (!move) return false;

        setGame(copy);

        const current = moves[moveIndex];
        if (!current) return true;

        const played = move.san.replace(/[+#?!]/g, '');
        const expected = playerSide === 'white' ? current.white : current.black;

        if (!expected) return true;

        setTotalInLine((t) => t + 1);

        // INCORRECT
        if (played !== expected) {
            recordAttempt(opening.id, opening.name, false);
            saveMistake({
                openingId: opening.id,
                openingName: opening.name,
                side: playerSide,
                reason: 'blunder',
                fen: before.fen(),
                expected,
                timestamp: Date.now(),
            });

            setFeedback({ type: 'incorrect', message: `✗ Incorrect — expected ${expected}` });
            setBoardAnim('incorrect');

            setTimeout(() => {
                setGame(before);
                setBoardAnim('');
            }, 600);

            return true;
        }

        // CORRECT
        recordAttempt(opening.id, opening.name, true);
        setCorrectInLine((c) => c + 1);
        setFeedback({ type: 'correct', message: '✓ Correct!' });
        setBoardAnim('correct');
        setTimeout(() => setBoardAnim(''), 600);

        // Auto-play opponent's response
        setTimeout(() => {
            const opponentMove = playerSide === 'white' ? current.black : moves[moveIndex + 1]?.white;

            if (opponentMove) {
                const afterResponse = new Chess(copy.fen());
                try {
                    afterResponse.move(opponentMove);
                    setGame(new Chess(afterResponse.fen()));
                } catch (e) {
                    // response move failed
                }
            }

            if (playerSide === 'white') {
                setMoveIndex((i) => i + 1);
            } else {
                setMoveIndex((i) => i + 1);
            }
        }, 400);

        return true;
    }

    // Custom square styles for highlights
    const [highlightSquares, setHighlightSquares] = useState({});

    useEffect(() => {
        if (feedback?.type === 'correct') {
            setHighlightSquares({});
        } else {
            setHighlightSquares({});
        }
    }, [feedback]);

    // Controls
    const goNext = () => {
        if (openingIndex < allOpenings.length - 1) resetOpening(openingIndex + 1);
    };
    const goPrev = () => {
        if (openingIndex > 0) resetOpening(openingIndex - 1);
    };
    const goRandom = () => {
        const idx = Math.floor(Math.random() * allOpenings.length);
        resetOpening(idx);
    };
    const showHintFn = () => {
        const current = moves[moveIndex];
        if (!current) return;
        const expected = playerSide === 'white' ? current.white : current.black;
        if (expected) {
            setFeedback({ type: 'hint', message: `💡 Hint: Play ${expected}` });
        }
    };

    // Eval bar value
    const evalScore = evaluatePosition(game.fen());

    // Progress
    const progress = moves.length > 0 ? (moveIndex / moves.length) * 100 : 0;

    // Timer progress (percentage remaining)
    const timerProgress = timerEnabled ? (timeLeft / timerDuration) * 100 : 100;
    const timerUrgent = timerEnabled && timeLeft <= 3;

    // Board wrapper class
    const boardClassName = [
        styles.boardWrapper,
        boardAnim === 'correct' ? styles.boardCorrect : '',
        boardAnim === 'incorrect' ? styles.boardIncorrect : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={styles.trainerPage}>
            {/* Header */}
            <div className={styles.trainerHeader}>
                <div>
                    <h1 className={styles.openingTitle}>{opening?.name || 'Select an Opening'}</h1>
                    <p className={styles.openingMeta}>
                        {opening?.eco && <span>{opening.eco} · </span>}
                        {opening?.opening && opening.opening !== opening.name && (
                            <span>{opening.opening} · </span>
                        )}
                        Playing as {playerSide}
                    </p>
                </div>

                <div className={styles.selectorGroup}>
                    <select
                        className={styles.selectDropdown}
                        value={openingIndex}
                        onChange={(e) => resetOpening(Number(e.target.value))}
                    >
                        {allOpenings.map((op, i) => (
                            <option key={`${op.id}-${i}`} value={i}>
                                {op.name} ({op.side})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Progress Bar */}
            <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            {/* Timer Bar */}
            {timerEnabled && !completed && moveIndex < moves.length && (
                <div className={styles.timerBar}>
                    <div
                        className={`${styles.timerFill} ${timerUrgent ? styles.timerUrgent : ''}`}
                        style={{ width: `${timerProgress}%` }}
                    />
                    <span className={styles.timerLabel}>{timeLeft}s</span>
                </div>
            )}

            {/* Trainer Layout */}
            <div className={styles.trainerLayout} style={{ marginTop: 'var(--space-lg)' }}>
                {/* Board Column */}
                <div className={styles.boardColumn}>
                    <div className={styles.boardWithEval}>
                        <EvalBar evaluation={evalScore} flipped={flipped} />
                        <div className={boardClassName}>
                            <Chessboard
                                position={game.fen()}
                                onPieceDrop={onPieceDrop}
                                boardWidth={420}
                                boardOrientation={flipped ? 'black' : 'white'}
                                arePiecesDraggable={!completed}
                                animationDuration={200}
                                customSquareStyles={highlightSquares}
                                customBoardStyle={{
                                    borderRadius: '4px',
                                }}
                                customDarkSquareStyle={{ backgroundColor: theme.dark }}
                                customLightSquareStyle={{ backgroundColor: theme.light }}
                            />
                        </div>
                    </div>

                    <TrainerControls
                        onFlip={() => setFlipped(!flipped)}
                        onRestart={() => resetOpening(openingIndex)}
                        onHint={showHintFn}
                        onPrev={goPrev}
                        onNext={goNext}
                        onRandom={goRandom}
                        canPrev={openingIndex > 0}
                        canNext={openingIndex < allOpenings.length - 1}
                        completed={completed}
                        showHints={showHints}
                    />
                </div>

                {/* Side Panel */}
                <div className={styles.sidePanel}>
                    {/* Feedback */}
                    {feedback && (
                        <div
                            className={
                                feedback.type === 'correct'
                                    ? styles.feedbackCorrect
                                    : feedback.type === 'incorrect'
                                        ? styles.feedbackIncorrect
                                        : feedback.type === 'hint'
                                            ? styles.feedbackHint
                                            : styles.feedbackComplete
                            }
                        >
                            {feedback.message}
                        </div>
                    )}

                    {/* Move List */}
                    <MoveList
                        moves={moves}
                        currentMoveIndex={moveIndex}
                        completed={completed}
                    />
                </div>
            </div>
        </div>
    );
}
