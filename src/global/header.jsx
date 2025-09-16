import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './header.css';

const Header = ({ title, subtitle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isCompact = !isHome; // Compact for all routes except home
  const [isNavigating, setIsNavigating] = useState(false);

  const handleHomeClick = () => {
    setIsNavigating(true);
    // Wait for fade out animation before navigating
    setTimeout(() => {
      navigate('/');
      setIsNavigating(false);
    }, 300);
  };

  // Reset navigation state when location changes
  useEffect(() => {
    setIsNavigating(false);
  }, [location]);

  return (
    <header className={`app-header ${isCompact ? 'app-header-compact' : ''}`}>
      <div className="header-content">
        {!isHome && (
          <button 
            className={`home-icon-button ${isNavigating ? 'fade-out' : ''}`} 
            onClick={handleHomeClick} 
            title="Go to Home"
          >
          </button>
        )}
        <div className="app-title">{title}</div>
        {!isCompact && <div className="app-subtitle">{subtitle}</div>}
      </div>
    </header>
  );
};

export default Header;
