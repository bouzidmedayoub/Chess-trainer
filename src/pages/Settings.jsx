import { useState } from 'react';
import { clearStats } from '../utils/statsManager';
import { clearMistakes } from '../utils/mistakes';
import styles from './Settings.module.css';

const SETTINGS_KEY = 'chess-trainer-settings';

function loadSettings() {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw
        ? JSON.parse(raw)
        : {
            timerEnabled: true,
            timerDuration: 8,
            autoAdvance: true,
            showHints: true,
            boardTheme: 'green',
        };
}

function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export default function Settings() {
    const [settings, setSettings] = useState(loadSettings());

    const update = (key, value) => {
        const next = { ...settings, [key]: value };
        setSettings(next);
        saveSettings(next);
    };

    const handleClearAll = () => {
        if (window.confirm('This will delete ALL your data (stats, mistakes, repertoire, settings). Continue?')) {
            clearStats();
            clearMistakes();
            localStorage.removeItem('chess-trainer-repertoire');
            localStorage.removeItem(SETTINGS_KEY);
            setSettings(loadSettings());
        }
    };

    return (
        <div className={styles.settingsPage}>
            <h1 className={styles.settingsTitle}>⚙️ Settings</h1>

            {/* Training */}
            <div className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}>Training</h2>

                <div className={styles.settingRow}>
                    <div>
                        <div className={styles.settingLabel}>Timer</div>
                        <div className={styles.settingDesc}>Track time per move and flag slow responses</div>
                    </div>
                    <button
                        className={settings.timerEnabled ? styles.toggleOn : styles.toggle}
                        onClick={() => update('timerEnabled', !settings.timerEnabled)}
                    />
                </div>

                {settings.timerEnabled && (
                    <div className={styles.settingRow}>
                        <div>
                            <div className={styles.settingLabel}>Timer Duration</div>
                            <div className={styles.settingDesc}>Seconds allowed per move</div>
                        </div>
                        <div className={styles.sliderGroup}>
                            <input
                                type="range"
                                className={styles.slider}
                                min={3}
                                max={30}
                                value={settings.timerDuration}
                                onChange={(e) => update('timerDuration', Number(e.target.value))}
                            />
                            <span className={styles.sliderValue}>{settings.timerDuration}s</span>
                        </div>
                    </div>
                )}

                <div className={styles.settingRow}>
                    <div>
                        <div className={styles.settingLabel}>Auto-Advance</div>
                        <div className={styles.settingDesc}>Automatically move to next opening after completion</div>
                    </div>
                    <button
                        className={settings.autoAdvance ? styles.toggleOn : styles.toggle}
                        onClick={() => update('autoAdvance', !settings.autoAdvance)}
                    />
                </div>

                <div className={styles.settingRow}>
                    <div>
                        <div className={styles.settingLabel}>Show Hints</div>
                        <div className={styles.settingDesc}>Allow the hint button during training</div>
                    </div>
                    <button
                        className={settings.showHints ? styles.toggleOn : styles.toggle}
                        onClick={() => update('showHints', !settings.showHints)}
                    />
                </div>
            </div>

            {/* Board */}
            <div className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}>Board Appearance</h2>

                <div className={styles.settingRow}>
                    <div>
                        <div className={styles.settingLabel}>Board Theme</div>
                        <div className={styles.settingDesc}>Choose the board color scheme</div>
                    </div>
                    <select
                        className="btn"
                        value={settings.boardTheme}
                        onChange={(e) => update('boardTheme', e.target.value)}
                        style={{ minWidth: '120px' }}
                    >
                        <option value="green">Classic Green</option>
                        <option value="brown">Wood Brown</option>
                        <option value="blue">Ice Blue</option>
                        <option value="gray">Slate Gray</option>
                    </select>
                </div>
            </div>

            {/* Danger Zone */}
            <div className={styles.dangerSection}>
                <h2 className={styles.sectionTitle}>Danger Zone</h2>
                <div className={styles.settingRow}>
                    <div>
                        <div className={styles.settingLabel}>Reset All Data</div>
                        <div className={styles.settingDesc}>Delete all statistics, mistakes, repertoire, and settings</div>
                    </div>
                    <button className={styles.dangerBtn} onClick={handleClearAll}>
                        🗑 Clear Everything
                    </button>
                </div>
            </div>
        </div>
    );
}
