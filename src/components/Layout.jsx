import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

const NAV_ITEMS = [
    { to: '/', icon: '🏠', label: 'Dashboard' },
    { to: '/stats', icon: '📊', label: 'Statistics' },
    { to: '/mistakes', icon: '🛠', label: 'Fix Mistakes' },
    { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={styles.layout}>
            {/* Mobile Toggle */}
            <button
                className={styles.mobileToggle}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? '✕' : '☰'}
            </button>

            {/* Overlay (mobile) */}
            {sidebarOpen && (
                <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <NavLink to="/" className={styles.logo} onClick={() => setSidebarOpen(false)}>
                    <span className={styles.logoIcon}>♚</span>
                    <span className={styles.logoText}>
                        <span className={styles.logoTitle}>Chess Trainer</span>
                        <span className={styles.logoSubtitle}>Opening Lab</span>
                    </span>
                </NavLink>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                isActive ? styles.navLinkActive : styles.navLink
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navLabel}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <span className={styles.sidebarFooterText}>v1.0 — No backend</span>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}
