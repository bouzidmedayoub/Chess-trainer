import { useState, useMemo } from 'react';
import { getOpeningsByCategory } from '../data/openingsData';
import styles from './Repertoire.module.css';

const REPERTOIRE_KEY = 'chess-trainer-repertoire';

function getRepertoire() {
    const raw = localStorage.getItem(REPERTOIRE_KEY);
    return raw ? JSON.parse(raw) : [];
}

function toggleRepertoire(openingId) {
    const rep = getRepertoire();
    const idx = rep.indexOf(openingId);
    if (idx >= 0) {
        rep.splice(idx, 1);
    } else {
        rep.push(openingId);
    }
    localStorage.setItem(REPERTOIRE_KEY, JSON.stringify(rep));
    return rep;
}

export default function Repertoire() {
    const categories = useMemo(() => getOpeningsByCategory(), []);
    const [search, setSearch] = useState('');
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [repertoire, setRepertoire] = useState(getRepertoire());

    const toggleExpand = (id, idx) => {
        const key = `${id}-${idx}`;
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleToggleRepertoire = (openingId) => {
        const updated = toggleRepertoire(openingId);
        setRepertoire([...updated]);
    };

    const filterOpenings = (openings) => {
        if (!search.trim()) return openings;
        const q = search.toLowerCase();
        return openings.filter(
            (o) =>
                o.name.toLowerCase().includes(q) ||
                (o.eco && o.eco.toLowerCase().includes(q)) ||
                (o.opening && o.opening.toLowerCase().includes(q))
        );
    };

    return (
        <div className={styles.repertoirePage}>
            <div className={styles.repertoireHeader}>
                <h1 className={styles.repertoireTitle}>📚 My Repertoire</h1>
                <input
                    type="text"
                    placeholder="Search openings..."
                    className={styles.searchInput}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {Object.entries(categories).map(([catName, openings]) => {
                const filtered = filterOpenings(openings);
                if (filtered.length === 0) return null;

                return (
                    <div key={catName} className={styles.category}>
                        <h2 className={styles.categoryTitle}>
                            {catName}
                            <span className={styles.categoryCount}>{filtered.length}</span>
                        </h2>
                        <div className={styles.cardsGrid}>
                            {filtered.map((opening, idx) => {
                                const uniqueKey = `${opening.id}-${idx}`;
                                const isExpanded = expandedIds.has(uniqueKey);
                                const inRepertoire = repertoire.includes(opening.id);

                                return (
                                    <div key={uniqueKey} className={styles.openingCard}>
                                        <div
                                            className={styles.cardHeader}
                                            onClick={() => toggleExpand(opening.id, idx)}
                                        >
                                            <div className={styles.cardInfo}>
                                                <div className={styles.cardName}>{opening.name}</div>
                                                <div className={styles.cardMeta}>
                                                    {opening.eco && (
                                                        <span className="badge badge-info">{opening.eco}</span>
                                                    )}
                                                    <span className={`badge ${opening.side === 'white' ? 'badge-success' : 'badge-error'}`}>
                                                        {opening.side}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {opening.moves.length} moves
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                className={isExpanded ? styles.cardToggleOpen : styles.cardToggle}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpand(opening.id, idx);
                                                }}
                                            >
                                                ▼
                                            </button>
                                        </div>

                                        {isExpanded && (
                                            <div className={styles.cardMoves}>
                                                {opening.moves.map((m, mi) => (
                                                    <div key={mi} className={styles.moveLine}>
                                                        <span className={styles.moveNum}>{mi + 1}.</span>
                                                        <span>{m.white || '...'}</span>
                                                        <span>{m.black || ''}</span>
                                                    </div>
                                                ))}
                                                <button
                                                    className={`btn ${inRepertoire ? 'btn-primary' : ''} ${styles.addBtn}`}
                                                    onClick={() => handleToggleRepertoire(opening.id)}
                                                >
                                                    {inRepertoire ? '★ In Repertoire' : '☆ Add to Repertoire'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
