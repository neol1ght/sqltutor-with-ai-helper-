import Link from 'next/link';

export function Header() {
    return (
        <header className="site-header">
            <div className="container">
                <div className="site-header__inner">
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