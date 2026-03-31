import { useEffect, useRef } from 'react';
import styles from './MoveList.module.css';

/**
 * MoveList — scrollable move history panel.
 *
 * Props:
 *   - moves: [{ white, black }]
 *   - currentMoveIndex: which move pair the user is on
 *   - completed: boolean
 */
export default function MoveList({ moves = [], currentMoveIndex = 0, completed = false }) {
    const listRef = useRef(null);

    // Auto-scroll to the current move
    useEffect(() => {
        if (listRef.current) {
            const active = listRef.current.querySelector('[data-active="true"]');
            if (active) {
                active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [currentMoveIndex]);

    if (!moves.length) {
        return (
            <div className={styles.moveList}>
                <div className={styles.moveListTitle}>Moves</div>
                <div className={styles.emptyState}>No opening selected</div>
            </div>
        );
    }

    return (
        <div className={styles.moveList} ref={listRef}>
            <div className={styles.moveListTitle}>Moves</div>
            {moves.map((move, i) => {
                const isPlayed = i < currentMoveIndex;
                const isCurrent = i === currentMoveIndex;
                const isPending = i > currentMoveIndex;

                const getClass = (isWhite) => {
                    if (completed || isPlayed) return `${isWhite ? styles.moveWhite : styles.moveBlack} ${styles.movePlayed}`;
                    if (isCurrent) return `${isWhite ? styles.moveWhite : styles.moveBlack} ${styles.moveCurrent}`;
                    return `${isWhite ? styles.moveWhite : styles.moveBlack} ${styles.movePending}`;
                };

                return (
                    <div
                        key={i}
                        className={styles.moveRow}
                        data-active={isCurrent ? 'true' : 'false'}
                    >
                        <span className={styles.moveNumber}>{i + 1}.</span>
                        <span className={getClass(true)}>{move.white || '...'}</span>
                        <span className={getClass(false)}>{move.black || ''}</span>
                    </div>
                );
            })}
        </div>
    );
}
