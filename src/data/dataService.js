import db from './db.json';
import { Chess } from 'chess.js';

/**
 * Parse a PGN string into an array of { white, black } move pairs.
 * Uses manual SAN token extraction instead of chess.js loadPgn()
 * because loadPgn requires strict PGN formatting with headers.
 */
function parsePGN(pgn) {
    // Strip move numbers and result markers, extract SAN tokens
    const tokens = pgn
        .replace(/\d+\.\s*/g, '')   // Remove move numbers like "1. " or "12. "
        .replace(/1-0|0-1|1\/2-1\/2|\*/g, '') // Remove results
        .trim()
        .split(/\s+/)
        .filter((t) => t.length > 0);

    const chess = new Chess();
    const history = [];

    for (const san of tokens) {
        try {
            const move = chess.move(san);
            if (move) history.push(move.san);
        } catch {
            // Skip invalid moves but keep going
            break;
        }
    }

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

// Pre-parse all line PGNs into move arrays on import
const parsedLines = {};
for (const [id, line] of Object.entries(db.lines)) {
    try {
        parsedLines[id] = {
            ...line,
            moves: parsePGN(line.pgn),
        };
    } catch (e) {
        // Isolate failures — one bad line shouldn't kill the app
        console.warn(`Failed to parse line "${id}":`, e.message);
        parsedLines[id] = { ...line, moves: [] };
    }
}

// ── Opening Queries ──

/**
 * Get all openings (without lines expanded).
 */
export function getOpenings() {
    return db.openings;
}

/**
 * Get a single opening by ID.
 */
export function getOpening(openingId) {
    return db.openings.find((o) => o.id === openingId) || null;
}

// ── Line Queries ──

/**
 * Get all parsed lines for an opening (filtered by openingId).
 */
export function getLinesForOpening(openingId) {
    const opening = getOpening(openingId);
    if (!opening) return [];
    return opening.lineIds
        .map((lid) => parsedLines[lid])
        .filter(Boolean);
}

/**
 * Get a single parsed line by its ID.
 */
export function getLine(lineId) {
    return parsedLines[lineId] || null;
}

/**
 * Get all parsed lines as a flat array.
 */
export function getAllLines() {
    return Object.values(parsedLines);
}

// ── Progress / Stats Helpers ──

/**
 * Get total number of lines across all openings.
 */
export function getTotalLineCount() {
    return Object.keys(parsedLines).length;
}

/**
 * Get the number of lines in a specific opening.
 */
export function getLineCountForOpening(openingId) {
    const opening = getOpening(openingId);
    return opening ? opening.lineIds.length : 0;
}

/**
 * Get the FEN position after the first move of a line (for mini board previews).
 * Returns the starting FEN if parsing fails.
 */
export function getPreviewFen(lineId) {
    const line = parsedLines[lineId];
    if (!line || !line.moves.length) return 'start';
    try {
        const chess = new Chess();
        const firstPair = line.moves[0];
        if (firstPair.white) chess.move(firstPair.white);
        if (firstPair.black) chess.move(firstPair.black);
        // Play a few more moves for a more interesting preview
        if (line.moves[1]?.white) chess.move(line.moves[1].white);
        if (line.moves[1]?.black) chess.move(line.moves[1].black);
        return chess.fen();
    } catch {
        return 'start';
    }
}

/**
 * Get a representative preview FEN for an entire opening
 * (uses the first line's position).
 */
export function getOpeningPreviewFen(openingId) {
    const opening = getOpening(openingId);
    if (!opening || !opening.lineIds.length) return 'start';
    return getPreviewFen(opening.lineIds[0]);
}
