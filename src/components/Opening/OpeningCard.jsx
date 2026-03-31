import { Link } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { getOpening, getOpeningPreviewFen, getLineCountForOpening } from '../../data/dataService';
import { getStats } from '../../utils/statsManager';
import OpeningProgress from './OpeningProgress';
import styles from './OpeningCard.module.css';

export default function OpeningCard({ openingId }) {
    const opening = getOpening(openingId);
    if (!opening) return null;

    const previewFen = getOpeningPreviewFen(openingId);
    const totalLines = getLineCountForOpening(openingId);

    // Compute learned lines from stats
    const stats = getStats();
    const learnedLines = opening.lineIds.filter((lid) => {
        const s = stats.openings[lid];
        return s && s.correct > 0;
    }).length;

    return (
        <Link to={`/openings/${openingId}`} className={styles.openingCard}>
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{opening.name}</h3>
                <span className={`badge ${opening.side === 'white' ? 'badge-success' : 'badge-error'} ${styles.sideBadge}`}>
                    {opening.side}
                </span>
            </div>

            <p className={styles.cardDesc}>{opening.description}</p>

            <div className={styles.boardPreview}>
                <Chessboard
                    position={previewFen}
                    boardWidth={180}
                    arePiecesDraggable={false}
                    animationDuration={0}
                    customBoardStyle={{ borderRadius: '8px' }}
                    customDarkSquareStyle={{ backgroundColor: '#334155' }}
                    customLightSquareStyle={{ backgroundColor: '#475569' }}
                />
            </div>

            <div className={styles.cardFooter}>
                <span className={styles.lineCount}>{totalLines} lines</span>
            </div>
            <OpeningProgress learned={learnedLines} total={totalLines} />
        </Link>
    );
}
