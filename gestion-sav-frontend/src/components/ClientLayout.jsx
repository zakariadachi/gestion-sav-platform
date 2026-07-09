import ClientNavbar from './ClientNavbar';

export default function ClientLayout({ children, onNewTicket, onSearch, searchQuery }) {
    return (
        <div className="es-layout">
            {/* ══════════════════════════════════════════
                TOP NAVBAR
            ══════════════════════════════════════════ */}
            <ClientNavbar onNewTicket={onNewTicket} onSearch={onSearch} searchQuery={searchQuery} />

            {/* ══════════════════════════════════════════
                MAIN CONTENT
            ══════════════════════════════════════════ */}
            <main className="es-main">
                {children}
            </main>

            {/* ══════════════════════════════════════════
                FOOTER
            ══════════════════════════════════════════ */}
            <footer className="es-footer">
                <div className="es-footer-inner">
                    <div>
                        <span className="es-footer-brand">Enterprise Support Solutions</span>
                        <p className="es-footer-copy">© {new Date().getFullYear()} Enterprise Support Solutions. All rights reserved.</p>
                    </div>
                    <div className="es-footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Security</a>
                        <a href="#">Contact Support</a>
                    </div>
                </div>
            </footer>

            {/* ── MOBILE FAB ── */}
            {onNewTicket && (
                <button onClick={onNewTicket} className="es-fab">
                    <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add</span>
                </button>
            )}
        </div>
    );
}
