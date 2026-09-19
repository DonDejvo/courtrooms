const Header = () => {
    return (
        <header className="app-header">
            <svg
                className="app-header__crest"
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A8823C"
                strokeWidth="1.4"
            >
                <path d="M12 2v18" />
                <path d="M4 6h16" />
                <path d="M2 6l3-3 3 3" />
                <path d="M2 6l2.5 6a3 3 0 0 0 5 0L12 6" />
                <path d="M22 6l-2.5 6a3 3 0 0 1-5 0L12 6" />
                <path d="M18 6l3-3-3 3" />
                <rect x="8" y="20" width="8" height="2" rx="0.5" />
            </svg>
            <div>
                <h1 className="app-header__title">Správa dokumentů jednacích síní</h1>
            </div>
        </header>
    );
};

export default Header;