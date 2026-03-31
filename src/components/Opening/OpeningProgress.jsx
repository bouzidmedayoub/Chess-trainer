import styles from './OpeningProgress.module.css';

export default function OpeningProgress({ learned, total, showLabel = true }) {
    const pct = total > 0 ? Math.round((learned / total) * 100) : 0;

    return (
        <div className={styles.progressWrapper}>
            <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${pct}%` }} />
            </div>
            {showLabel && (
                <div className={styles.progressLabel}>
                    <span>{learned} / {total} lines</span>
                    <span>{pct}%</span>
                </div>
            )}
        </div>
    );
}
