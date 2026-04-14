import { Link, useLocation } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import "./navbar.css";

function Navbar() {
  const { isSignedIn } = useUser();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <span className="logo-text">MOVIE</span>
          <span className="logo-accent">WATCHLIST</span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Search
          </Link>
          {isSignedIn && (
            <Link
              to="/watchlist"
              className={`nav-link ${location.pathname === "/watchlist" ? "active" : ""}`}
            >
              My Watchlist
            </Link>
          )}
        </div>

        {/* User Section */}
        <div className="nav-user">
          {!isSignedIn ? (
            <div className="auth-buttons">
              <Link to="/sign-in" className="auth-link sign-in">
                Sign In
              </Link>
              <Link to="/sign-up" className="auth-link sign-up">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="clerk-user-button">
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
