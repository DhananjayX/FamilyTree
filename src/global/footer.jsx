import React from 'react';
import './footer.css';

const Footer = ({ text, year = new Date().getFullYear() }) => {
  return (
    <footer className="app-footer">
      <div className="container">
        <p>&copy; {year} {text}</p>
      </div>
    </footer>
  );
};

export default Footer;
