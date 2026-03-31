import styles from './TrainerControls.module.css';

/**
 * TrainerControls — action buttons below/beside the board.
 *
 * Props:
 *   - onFlip: flip board
 *   - onRestart: restart current line
 *   - onHint: show hint
 *   - onPrev: previous opening
 *   - onNext: next opening
 *   - onRandom: pick random opening
 *   - canPrev, canNext: boolean flags
 *   - completed: boolean
 *   - showHints: whether to show the Hint button (default true)
 */
export default function TrainerControls({
    onFlip,
    onRestart,
    onHint,
    onPrev,
    onNext,
    onRandom,
    canPrev = true,
    canNext = true,
    completed = false,
    showHints = true,
}) {
    return (
        <div className={styles.controls}>
            <button className={styles.controlBtn} onClick={onPrev} disabled={!canPrev} title="Previous Opening">
                <span className={styles.controlIcon}>⏮</span> Prev
            </button>
            <button className={styles.controlBtn} onClick={onRestart} title="Restart Line">
                <span className={styles.controlIcon}>🔄</span> Restart
            </button>
            <button className={styles.controlBtn} onClick={onFlip} title="Flip Board">
                <span className={styles.controlIcon}>🔃</span> Flip
            </button>
            {showHints && (
                <button className={styles.controlBtn} onClick={onHint} disabled={completed} title="Show Hint">
                    <span className={styles.controlIcon}>💡</span> Hint
                </button>
            )}
            <button className={styles.controlBtn} onClick={onRandom} title="Random Opening">
                <span className={styles.controlIcon}>🔀</span> Random
            </button>
            <button className={styles.controlBtn} onClick={onNext} disabled={!canNext} title="Next Opening">
                Next <span className={styles.controlIcon}>⏭</span>
            </button>
        </div>
    );
}
