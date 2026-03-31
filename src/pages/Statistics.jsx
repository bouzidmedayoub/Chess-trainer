import { useState } from 'react';
import { getStats, getAccuracy, getSessions, clearStats } from '../utils/statsManager';
import { clearMistakes } from '../utils/mistakes';
import styles from './Statistics.module.css';

export default function Statistics() {
    const [stats, setStats] = useState(getStats());
    const [sessions, setSessions] = useState(getSessions());
    const accuracy = stats.totalAttempts > 0
        ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100)
        : 0;

    const openingEntries = Object.entries(stats.openings).sort(
        (a, b) => b[1].total - a[1].total
    );

    const handleClear = () => {
        if (window.confirm('Clear all statistics and mistake data? This cannot be undone.')) {
            clearStats();
            clearMistakes();
            setStats({ totalAttempts: 0, totalCorrect: 0, openings: {} });
            setSessions([]);
        }
    };

    // SVG ring
    const ringRadius = 50;
    const circumference = 2 * Math.PI * ringRadius;
    const offset = circumference - (accuracy / 100) * circumference;

    return (
        <div className={styles.statsPage}>
            <h1 className={styles.statsTitle}>📊 Statistics</h1>

            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryValue}>{stats.totalAttempts}</div>
                    <div className={styles.summaryLabel}>Total Moves</div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryValue}>{stats.totalCorrect}</div>
                    <div className={styles.summaryLabel}>Correct Moves</div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryValue}>{openingEntries.length}</div>
                    <div className={styles.summaryLabel}>Openings Trained</div>
                </div>
            </div>

            {/* Accuracy Ring */}
            <div className={styles.accuracySection}>
                <div className={styles.accuracyRing}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle
                            cx="60"
                            cy="60"
                            r={ringRadius}
                            fill="none"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth="10"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r={ringRadius}
                            fill="none"
                            stroke="var(--accent-primary)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ transition: 'stroke-dashoffset 1s ease' }}
                        />
                    </svg>
                    <div className={styles.accuracyPercent}>{accuracy}%</div>
                </div>
                <div className={styles.accuracyDetails}>
                    <h3>Overall Accuracy</h3>
                    <p>
                        You've played {stats.totalCorrect} correct moves out of{' '}
                        {stats.totalAttempts} total attempts across {openingEntries.length} openings.
                    </p>
                </div>
            </div>

            {/* Per-Opening Accuracy Bars */}
            {openingEntries.length > 0 && (
                <div className={styles.openingBarsSection}>
                    <h2 className={styles.sectionTitle}>Per-Opening Accuracy</h2>
                    {openingEntries.map(([id, data]) => {
                        const pct = Math.round((data.correct / data.total) * 100);
                        const fillClass =
                            pct >= 80 ? styles.barFillGood : pct >= 50 ? styles.barFillMid : styles.barFillLow;

                        return (
                            <div key={id} className={styles.openingBar}>
                                <span className={styles.barName} title={data.name}>
                                    {data.name}
                                </span>
                                <div className={styles.barTrack}>
                                    <div
                                        className={`${styles.barFill} ${fillClass}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className={styles.barPercent}>{pct}%</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Recent Sessions */}
            {sessions.length > 0 && (
                <div className={styles.sessionsSection}>
                    <h2 className={styles.sectionTitle}>Recent Sessions</h2>
                    {sessions
                        .slice()
                        .reverse()
                        .slice(0, 15)
                        .map((s, i) => (
                            <div key={i} className={styles.sessionRow}>
                                <span className={styles.sessionName}>{s.openingName}</span>
                                <span
                                    className={styles.sessionAccuracy}
                                    style={{
                                        color:
                                            s.accuracy >= 80
                                                ? 'var(--accent-success)'
                                                : s.accuracy >= 50
                                                    ? 'var(--accent-primary)'
                                                    : 'var(--accent-error)',
                                    }}
                                >
                                    {s.accuracy}%
                                </span>
                                <span className={styles.sessionDate}>
                                    {new Date(s.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                </div>
            )}

            {stats.totalAttempts === 0 && (
                <div className={styles.emptyState}>
                    <p>No statistics yet. Start training to see your progress!</p>
                </div>
            )}

            {stats.totalAttempts > 0 && (
                <button className={`btn ${styles.clearBtn}`} onClick={handleClear}>
                    🗑 Clear All Data
                </button>
            )}
        </div>
    );
}
