import { getStats } from '../../utils/statsManager';
import styles from './LineSelector.module.css';

export default function LineSelector({ lines, selectedLineId, onSelectLine }) {
    const stats = getStats();

    return (
        <div className={styles.selectorPanel}>
            <div className={styles.selectorTitle}>Lines</div>
            {lines.map((line, i) => {
                const isActive = line.id === selectedLineId;
                const isLearned = stats.openings[line.id]?.correct > 0;

                return (
                    <div
                        key={line.id}
                        className={isActive ? styles.lineItemActive : styles.lineItem}
                        onClick={() => onSelectLine(line.id)}
                    >
                        <span className={styles.lineIndex}>{i + 1}</span>
                        <span className={styles.lineName}>{line.name}</span>
                        {isLearned && <span className={styles.learnedDot} title="Learned" />}
                    </div>
                );
            })}
        </div>
    );
}
