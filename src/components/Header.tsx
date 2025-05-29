import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Header.css";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
            <nav className="navbar">
                <div className="logo-container">
                    <Link to='/' className="logo-link">
                        <span className="logo-text">MRTScan</span>
                        <span className="logo-extension">-Uz</span>
                    </Link>
                </div>
                <div className="nav-links">
                    <Link to='/' className="nav-link"><span>Home</span></Link>
                    <Link to='/upload' className="nav-link"><span>Analiyz</span></Link>
                    <Link to='/about' className="nav-link"><span>About</span></Link>
                </div>
            </nav>
        </header>
    )
}