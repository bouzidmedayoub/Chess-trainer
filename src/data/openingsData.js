import londonData from './London.json';
import sicilianData from './Sicilian Defense.json';
import indianData from './indianOpenings.json';
import openingsData from './openings.json';
import queensGambitData from './queensGambit.json';
import { Chess } from 'chess.js';

/**
 * Parse a PGN string into an array of { white, black } move pairs.
 */
function parsePGN(pgn) {
    const chess = new Chess();
    chess.loadPgn(pgn);
    const history = chess.history();
    const moves = [];
    for (let i = 0; i < history.length; i += 2) {
        const pair = { white: history[i] };
        if (history[i + 1]) {
            pair.black = history[i + 1];
        }
        moves.push(pair);
    }
    return moves;
}

/**
 * Generate a slug ID from a name string.
 * E.g. "G7 Heist" → "g7-heist"
 */
function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Normalize an opening entry into a consistent shape:
 * { id, name, eco?, opening?, side, moves: [{ white, black }] }
 *
 * Supports both `"name"` and `"line name"` fields.
 * Auto-generates an ID from the name if none is provided.
 */
function normalizeOpening(entry, defaultSide, filePrefix) {
    const name = entry.name || entry['line name'] || entry.opening || 'Unknown';
    const id = entry.id || (filePrefix ? `${filePrefix}-${slugify(name)}` : slugify(name));

    return {
        id,
        name,
        eco: entry.eco || '',
        opening: entry.opening || name,
        side: defaultSide,
        moves: entry.pgn ? parsePGN(entry.pgn) : [],
    };
}

/**
 * Get all openings from all data files, normalized.
 */
export function getAllOpenings() {
    const all = [];

    // openings.json — white side
    openingsData.openings.forEach((o) => {
        all.push(normalizeOpening(o, 'white', 'opening'));
    });

    // queensGambit.json — white side
    queensGambitData.openings.forEach((o) => {
        all.push(normalizeOpening(o, 'white', 'qg'));
    });

    // London.json — has its own `side`
    londonData.openings.forEach((o) => {
        all.push(normalizeOpening(o, londonData.side || 'white', 'london'));
    });

    // indianOpenings.json — has its own `side`
    indianData.openings.forEach((o) => {
        all.push(normalizeOpening(o, indianData.side || 'black', 'indian'));
    });

    // Sicilian Defense.json — likely black side
    sicilianData.openings.forEach((o) => {
        all.push(normalizeOpening(o, sicilianData.side || 'black', 'sicilian'));
    });

    return all;
}

/**
 * Group openings by category (eco family or side).
 */
export function getOpeningsByCategory() {
    const all = getAllOpenings();
    const categories = {};

    all.forEach((o) => {
        const cat = o.side === 'white' ? 'White Repertoire' : 'Black Repertoire';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(o);
    });

    return categories;
}
