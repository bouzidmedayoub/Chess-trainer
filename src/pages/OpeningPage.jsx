import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getOpening, getLinesForOpening, getLine } from '../data/dataService';
import { saveMistake } from '../utils/mistakes';
import { recordAttempt, recordSession } from '../utils/statsManager';
import useSettings, { BOARD_THEMES } from '../utils/useSettings';
import EvalBar from '../components/EvalBar';
import MoveList from '../components/MoveList';
import TrainerControls from '../components/TrainerControls';
import LineSelector from '../components/Training/LineSelector';
import FeedbackBanner from '../components/Training/FeedbackBanner';
import TimerBar from '../components/Training/TimerBar';
import styles from './OpeningPage.module.css';

function evaluatePosition(fen) {
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    const board = fen.split(' ')[0];
    let score = 0;
    for (const ch of board) {
        const lower = ch.toLowerCase();
        if (pieceValues[lower] !== undefined) {
            score += ch === lower ? -pieceValues[lower] : pieceValues[lower];
        }
    }
    return score;
}

export default function OpeningPage() {
    const { openingId } = useParams();
    const opening = getOpening(openingId);
    const lines = getLinesForOpening(openingId);

    const { settings } = useSettings();
    const { timerEnabled, timerDuration, autoAdvance, showHints, boardTheme } = settings;
    const theme = BOARD_THEMES[boardTheme] || BOARD_THEMES.green;

    // ── State ──
    const [selectedLineId, setSelectedLineId] = useState(null);
    const [game, setGame] = useState(new Chess());
    const [moveIndex, setMoveIndex] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [flipped, setFlipped] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [boardAnim, setBoardAnim] = useState('');
    const [correctInLine, setCorrectInLine] = useState(0);
    const [totalInLine, setTotalInLine] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerKey, setTimerKey] = useState(0); // Increment to reset timer

    const selectedLine = selectedLineId ? getLine(selectedLineId) : null;
    const moves = selectedLine?.moves || [];
    const playerSide = opening?.side || 'white';

    // ── Reset when opening changes (URL change) ──
    useEffect(() => {
        setSelectedLineId(null);
        setGame(new Chess());
        setMoveIndex(0);
        setCompleted(false);
        setFeedback(null);
        setBoardAnim('');
        setCorrectInLine(0);
        setTotalInLine(0);
        setTimerRunning(false);
        setFlipped(playerSide === 'black');
    }, [openingId, playerSide]);

    // ── Select a line ──
    const selectLine = useCallback((lineId) => {
        setSelectedLineId(lineId);
        setGame(new Chess());
        setMoveIndex(0);
        setCompleted(false);
        setFeedback(null);
        setBoardAnim('');
        setCorrectInLine(0);
        setTotalInLine(0);
        setTimerRunning(false);
        setTimerKey((k) => k + 1);
    }, []);

    // Auto-play first white move for black side
    useEffect(() => {
        if (!selectedLine || playerSide !== 'black' || moveIndex !== 0 || moves.length === 0) return;
        const firstWhiteMove = moves[0]?.white;
        if (firstWhiteMove) {
            setTimeout(() => {
                const g = new Chess(game.fen());
                try {
                    g.move(firstWhiteMove);
                    setGame(new Chess(g.fen()));
                    if (timerEnabled) {
                        setTimerRunning(true);
                        setTimerKey((k) => k + 1);
                    }
                } catch (e) { /* */ }
            }, 400);
        }
    }, [selectedLineId]);

    // Start timer for white on first load
    useEffect(() => {
        if (selectedLine && playerSide === 'white' && moveIndex === 0 && timerEnabled) {
            setTimerRunning(true);
            setTimerKey((k) => k + 1);
        }
    }, [selectedLineId]);

    // ── Completion ──
    useEffect(() => {
        if (moveIndex >= moves.length && moves.length > 0 && !completed) {
            setCompleted(true);
            setTimerRunning(false);
            setFeedback({ type: 'complete', message: '🎉 Line completed! Well done.' });

            if (totalInLine > 0) {
                const acc = Math.round((correctInLine / totalInLine) * 100);
                recordSession(selectedLineId, selectedLine.name, acc);
            }

            // Auto-advance to next line
            if (autoAdvance) {
                const idx = lines.findIndex((l) => l.id === selectedLineId);
                if (idx < lines.length - 1) {
                    setTimeout(() => selectLine(lines[idx + 1].id), 2000);
                }
            }
        }
    }, [moveIndex, completed, moves.length]);

    // ── Timer timeout ──
    const handleTimeout = useCallback(() => {
        if (completed || !selectedLine) return;
        const current = moves[moveIndex];
        const expected = playerSide === 'white' ? current?.white : current?.black;
        if (expected) {
            recordAttempt(selectedLineId, selectedLine.name, false);
            saveMistake({
                openingId: selectedLineId,
                openingName: selectedLine.name,
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
        setTimerRunning(false);
    }, [completed, selectedLine, moves, moveIndex, playerSide, game, selectedLineId]);

    // ── Piece drop ──
    function onPieceDrop(from, to) {
        const turn = game.turn();
        const isPlayerTurn =
            (playerSide === 'white' && turn === 'w') ||
            (playerSide === 'black' && turn === 'b');

        if (!isPlayerTurn || completed || !selectedLine) return false;

        const before = new Chess(game.fen());
        const copy = new Chess(game.fen());
        const move = copy.move({ from, to, promotion: 'q' });
        if (!move) return false;

        setGame(copy);
        setTimerRunning(false);

        const current = moves[moveIndex];
        if (!current) return true;

        const played = move.san.replace(/[+#?!]/g, '');
        const expected = playerSide === 'white' ? current.white : current.black;
        if (!expected) return true;

        setTotalInLine((t) => t + 1);

        // INCORRECT
        if (played !== expected) {
            recordAttempt(selectedLineId, selectedLine.name, false);
            saveMistake({
                openingId: selectedLineId,
                openingName: selectedLine.name,
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
                if (timerEnabled) {
                    setTimerRunning(true);
                    setTimerKey((k) => k + 1);
                }
            }, 600);
            return true;
        }

        // CORRECT
        recordAttempt(selectedLineId, selectedLine.name, true);
        setCorrectInLine((c) => c + 1);
        setFeedback({ type: 'correct', message: '✓ Correct!' });
        setBoardAnim('correct');
        setTimeout(() => setBoardAnim(''), 600);

        // Auto-play opponent response
        setTimeout(() => {
            const opponentMove = playerSide === 'white'
                ? current.black
                : moves[moveIndex + 1]?.white;

            if (opponentMove) {
                const afterResponse = new Chess(copy.fen());
                try {
                    afterResponse.move(opponentMove);
                    setGame(new Chess(afterResponse.fen()));
                } catch (e) { /* */ }
            }

            setMoveIndex((i) => i + 1);

            if (timerEnabled) {
                setTimerRunning(true);
                setTimerKey((k) => k + 1);
            }
        }, 400);

        return true;
    }

    // ── Controls ──
    const goNextLine = () => {
        const idx = lines.findIndex((l) => l.id === selectedLineId);
        if (idx < lines.length - 1) selectLine(lines[idx + 1].id);
    };
    const goPrevLine = () => {
        const idx = lines.findIndex((l) => l.id === selectedLineId);
        if (idx > 0) selectLine(lines[idx - 1].id);
    };
    const goRandom = () => {
        const idx = Math.floor(Math.random() * lines.length);
        selectLine(lines[idx].id);
    };
    const showHintFn = () => {
        const current = moves[moveIndex];
        if (!current) return;
        const expected = playerSide === 'white' ? current.white : current.black;
        if (expected) setFeedback({ type: 'hint', message: `💡 Hint: Play ${expected}` });
    };

    const progress = moves.length > 0 ? (moveIndex / moves.length) * 100 : 0;
    const evalScore = evaluatePosition(game.fen());

    const boardClassName = [
        styles.boardWrapper,
        boardAnim === 'correct' ? styles.boardCorrect : '',
        boardAnim === 'incorrect' ? styles.boardIncorrect : '',
    ].filter(Boolean).join(' ');

    if (!opening) {
        return (
            <div className={styles.openingPage}>
                <div className={styles.selectPrompt}>
                    <span className={styles.selectPromptIcon}>🔍</span>
                    Opening not found.
                    <br />
                    <Link to="/" className={styles.backLink} style={{ marginTop: '16px', display: 'inline-flex' }}>← Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.openingPage}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.pageTitle}>{opening.name}</h1>
                    <div className={styles.pageMeta}>
                        {opening.eco && <span className="badge badge-info">{opening.eco}</span>}
                        <span className={`badge ${opening.side === 'white' ? 'badge-success' : 'badge-error'}`}>
                            {opening.side}
                        </span>
                        <span>{lines.length} lines</span>
                        {selectedLine && <span>· {selectedLine.name}</span>}
                    </div>
                </div>
                <Link to="/" className={styles.backLink}>← Dashboard</Link>
            </div>

            {/* Progress */}
            {selectedLine && (
                <>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                    {timerEnabled && !completed && moveIndex < moves.length && (
                        <TimerBar
                            key={timerKey}
                            duration={timerDuration}
                            isRunning={timerRunning}
                            onTimeout={handleTimeout}
                        />
                    )}
                </>
            )}

            {/* Two-Column Training Layout */}
            <div className={styles.trainingLayout}>
                {/* Left: Board Column */}
                <div className={styles.boardColumn}>
                    {/* Line Selector (above board) */}
                    <div className={styles.selectorColumn}>
                        <LineSelector
                            lines={lines}
                            selectedLineId={selectedLineId}
                            onSelectLine={selectLine}
                        />
                    </div>

                    {selectedLine ? (
                        <>
                            <div className={styles.boardWithEval}>
                                <EvalBar evaluation={evalScore} flipped={flipped} />
                                <div className={boardClassName}>
                                    <Chessboard
                                        position={game.fen()}
                                        onPieceDrop={onPieceDrop}
                                        boardWidth={640}
                                        boardOrientation={flipped ? 'black' : 'white'}
                                        arePiecesDraggable={!completed}
                                        animationDuration={200}
                                        customBoardStyle={{ borderRadius: '6px' }}
                                        customDarkSquareStyle={{ backgroundColor: theme.dark }}
                                        customLightSquareStyle={{ backgroundColor: theme.light }}
                                    />
                                </div>
                            </div>

                            <TrainerControls
                                onFlip={() => setFlipped(!flipped)}
                                onRestart={() => selectLine(selectedLineId)}
                                onHint={showHintFn}
                                onPrev={goPrevLine}
                                onNext={goNextLine}
                                onRandom={goRandom}
                                canPrev={lines.findIndex((l) => l.id === selectedLineId) > 0}
                                canNext={lines.findIndex((l) => l.id === selectedLineId) < lines.length - 1}
                                completed={completed}
                                showHints={showHints}
                            />
                        </>
                    ) : (
                        <div className={styles.selectPrompt}>
                            <span className={styles.selectPromptIcon}>♟️</span>
                            Select a line to start training
                        </div>
                    )}
                </div>

                {/* Right: Side Panel */}
                {selectedLine && (
                    <div className={styles.sidePanel}>
                        <FeedbackBanner type={feedback?.type} message={feedback?.message} />
                        <MoveList
                            moves={moves}
                            currentMoveIndex={moveIndex}
                            completed={completed}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

