import { useState, useMemo } from 'react';
import { getOpenings, getTotalLineCount } from '../data/dataService';
import { getStats } from '../utils/statsManager';
import OpeningCard from '../components/Opening/OpeningCard';
import styles from './Dashboard.module.css';

export default function Dashboard() {
    const openings = getOpenings();
    const totalLines = getTotalLineCount();
    const stats = getStats();
    const [search, setSearch] = useState('');
    const [sideFilter, setSideFilter] = useState('all'); // 'all' | 'white' | 'black'

    // Compute total learned lines
    const learnedLines = useMemo(() => {
        return Object.values(stats.openings).filter((s) => s.correct > 0).length;
    }, [stats]);

    // Filtered openings
    const filtered = useMemo(() => {
        return openings.filter((o) => {
            if (sideFilter !== 'all' && o.side !== sideFilter) return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                return (
                    o.name.toLowerCase().includes(q) ||
                    o.description.toLowerCase().includes(q) ||
                    o.eco.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [openings, search, sideFilter]);

    return (
        <div className={styles.dashboard}>
            {/* Hero */}
            <header className={styles.hero}>
                <span className={styles.heroIcon}>♚</span>
                <h1 className={styles.heroTitle}>Chess Opening Trainer</h1>
                <p className={styles.heroSubtitle}>
                    Master your openings through repetition. Train, analyze, and track your progress.
                </p>
            </header>

            {/* Filter Row */}
            <div className={styles.filterRow}>
                <div className={styles.filterLeft}>
                    <input
                        type="text"
                        placeholder="Search openings..."
                        className={styles.searchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        className={sideFilter === 'all' ? styles.filterBtnActive : styles.filterBtn}
                        onClick={() => setSideFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={sideFilter === 'white' ? styles.filterBtnActive : styles.filterBtn}
                        onClick={() => setSideFilter('white')}
                    >
                        White
                    </button>
                    <button
                        className={sideFilter === 'black' ? styles.filterBtnActive : styles.filterBtn}
                        onClick={() => setSideFilter('black')}
                    >
                        Black
                    </button>
                </div>

                <div className={styles.statsPill}>
                    <span className={styles.statsPillValue}>{learnedLines}</span>
                    <span>/</span>
                    <span>{totalLines} lines learned</span>
                </div>
            </div>

            {/* Opening Cards Grid */}
            {filtered.length > 0 ? (
                <div className={styles.cardsGrid}>
                    {filtered.map((o) => (
                        <OpeningCard key={o.id} openingId={o.id} />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    No openings match your search.
                </div>
            )}
        </div>
    );
}
