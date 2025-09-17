import React from 'react';
import { NavLink } from 'react-router-dom';
import homelabels from '../../labels/homelabels';
import './navigation.css';

const Navigation = ({ className = '' }) => {
  const items = (homelabels && homelabels.featuresData) || [];

  return (
    <nav className={`ft-nav ${className}`}>
      {items.map((it, idx) => (
        <NavLink key={idx} to={it.route || '/'} className="ft-nav-link">
          {it.title2 || it.title}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;
