import React from 'react';
import { NavLink } from 'react-router-dom';
import './navigation.css';

const Navigation = ({ className = '' }) => {
  return (
    <nav className={`ft-nav ${className}`}>
      <NavLink to="/" end className="ft-nav-link">Home</NavLink>
      <NavLink to="/members" className="ft-nav-link">Members</NavLink>
      <NavLink to="/persons" className="ft-nav-link">Persons</NavLink>
      <NavLink to="/viewtree" className="ft-nav-link">View Tree</NavLink>
      <NavLink to="/upcoming" className="ft-nav-link">Timeline</NavLink>
    </nav>
  );
};

export default Navigation;
