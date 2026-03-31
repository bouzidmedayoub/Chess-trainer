const STATS_KEY = 'chess-trainer-stats';
const SESSIONS_KEY = 'chess-trainer-sessions';

/**
 * Record a single move attempt.
 */
export function recordAttempt(openingId, openingName, correct) {
    const stats = getStats();
    if (!stats.openings[openingId]) {
        stats.openings[openingId] = { name: openingName, correct: 0, total: 0 };
    }
    stats.openings[openingId].total += 1;
    if (correct) stats.openings[openingId].correct += 1;
    stats.totalAttempts += 1;
    if (correct) stats.totalCorrect += 1;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

/**
 * Record completion of a full opening line.
 */
export function recordSession(openingId, openingName, accuracy) {
    const sessions = getSessions();
    sessions.push({
        openingId,
        openingName,
        accuracy,
        timestamp: Date.now(),
    });
    // Keep last 50 sessions
    if (sessions.length > 50) sessions.shift();
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

/**
 * Get all stats.
 */
export function getStats() {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
    return { totalAttempts: 0, totalCorrect: 0, openings: {} };
}

/**
 * Get session history.
 */
export function getSessions() {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) return JSON.parse(raw);
    return [];
}

/**
 * Get overall accuracy percentage.
 */
export function getAccuracy() {
    const stats = getStats();
    if (stats.totalAttempts === 0) return 0;
    return Math.round((stats.totalCorrect / stats.totalAttempts) * 100);
}

/**
 * Clear all stats.
 */
export function clearStats() {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(SESSIONS_KEY);
}
