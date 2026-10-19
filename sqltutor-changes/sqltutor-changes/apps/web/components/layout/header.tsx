import Link from 'next/link';

export function Header({
                           onMenuClick,
                       }: {
    onMenuClick?: () => void;
}) {
    return (
        <header className="site-header">
            <div className="container">
                <div className="site-header__inner">
                    {onMenuClick ? (
                        <button
                            type="button"
                            aria-label="Открыть меню"
                            className="site-header__menu lg:hidden"
                            onClick={onMenuClick}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    ) : null}

                    <Link
                        href="/"
                        className="logo"
                    >
                        <span className="logo__mark">
                            S
                        </span>

                        SQLTutor
                    </Link>

                    <nav className="site-header__nav">
                        <a href="#features">
                            Возможности
                        </a>

                        <a href="#cases">
                            Кейсы
                        </a>

                        <a href="#how">
                            Как это работает
                        </a>
                    </nav>

                    <Link
                        href="/login"
                        className="site-header__login"
                    >
                        Войти
                    </Link>
                </div>
            </div>
        </header>
    );
}