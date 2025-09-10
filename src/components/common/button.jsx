import React from 'react';
import './button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  const buttonClass = `btn-${variant} ${className}`;
  
  return (
    <button 
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
