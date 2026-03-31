import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './TimerBar.module.css';

export default function TimerBar({ duration, isRunning, onTimeout }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const timerRef = useRef(null);

    const clear = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Reset when duration changes or when toggled
    useEffect(() => {
        setTimeLeft(duration);
    }, [duration, isRunning]);

    useEffect(() => {
        if (!isRunning) {
            clear();
            return;
        }

        setTimeLeft(duration);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return clear;
    }, [isRunning, duration, clear]);

    // Trigger timeout callback
    useEffect(() => {
        if (timeLeft === 0 && isRunning && onTimeout) {
            onTimeout();
        }
    }, [timeLeft, isRunning, onTimeout]);

    const pct = (timeLeft / duration) * 100;
    const urgent = timeLeft <= 3;

    if (!isRunning) return null;

    return (
        <div className={styles.timerBar}>
            <div
                className={`${styles.timerFill} ${urgent ? styles.timerUrgent : ''}`}
                style={{ width: `${pct}%` }}
            />
            <span className={styles.timerLabel}>{timeLeft}s</span>
        </div>
    );
}
