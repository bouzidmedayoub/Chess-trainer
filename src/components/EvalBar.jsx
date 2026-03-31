import styles from './EvalBar.module.css';

/**
 * EvalBar — vertical evaluation bar shown to the left of the chessboard.
 * 
 * Props:
 *   - evaluation: number from -10 to +10 (positive = white advantage)
 *   - flipped: boolean — if true, bar is inverted for black POV
 */
export default function EvalBar({ evaluation = 0, flipped = false }) {
    // Clamp evaluation to [-10, 10]
    const clamped = Math.max(-10, Math.min(10, evaluation));

    // Convert to a percentage for white's portion (50% = equal)
    // Sigmoid-like mapping for smoother visual distribution
    const whitePercent = 50 + (clamped / 10) * 50;

    // If board is flipped, invert the visual
    const displayWhite = flipped ? 100 - whitePercent : whitePercent;
    const displayBlack = 100 - displayWhite;

    // Format the evaluation number for display
    const formatEval = (val) => {
        if (val === 0) return '=';
        const sign = val > 0 ? '+' : '';
        return `${sign}${val.toFixed(1)}`;
    };

    return (
        <div className={styles.evalBar}>
            {/* Dark (black) portion from top */}
            <div
                className={styles.evalBarDark}
                style={{ height: `${displayBlack}%` }}
            />
            {/* Light (white) portion from bottom */}
            <div
                className={styles.evalBarInner}
                style={{ height: `${displayWhite}%` }}
            />
            {/* Labels */}
            <span className={styles.evalLabelTop}>
                {flipped ? formatEval(Math.abs(evaluation)) : formatEval(-Math.abs(evaluation))}
            </span>
            <span className={styles.evalLabelBottom}>
                {formatEval(evaluation)}
            </span>
        </div>
    );
}
