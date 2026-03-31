import { useState, useCallback } from 'react';

const SETTINGS_KEY = 'chess-trainer-settings';

const DEFAULTS = {
    timerEnabled: true,
    timerDuration: 8,
    autoAdvance: true,
    showHints: true,
    boardTheme: 'green',
};

/**
 * Board theme color maps.
 */
export const BOARD_THEMES = {
    green: { dark: '#779952', light: '#edeed1' },
    brown: { dark: '#b58863', light: '#f0d9b5' },
    blue: { dark: '#4b7399', light: '#eae9d2' },
    gray: { dark: '#86a666', light: '#efefef' },
};

/**
 * Shared hook to read settings from localStorage.
 * Returns { settings, refreshSettings }.
 */
export default function useSettings() {
    const read = () => {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    };

    const [settings, setSettings] = useState(read);

    const refreshSettings = useCallback(() => {
        setSettings(read());
    }, []);

    return { settings, refreshSettings };
}
