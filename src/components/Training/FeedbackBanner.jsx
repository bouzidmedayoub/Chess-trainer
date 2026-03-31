import styles from './FeedbackBanner.module.css';

const TYPE_MAP = {
    correct: styles.correct,
    incorrect: styles.incorrect,
    hint: styles.hint,
    complete: styles.complete,
};

export default function FeedbackBanner({ type, message }) {
    if (!message) return null;
    const className = TYPE_MAP[type] || styles.feedback;

    return <div className={className}>{message}</div>;
}
