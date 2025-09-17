import React from 'react';
import './SmallButton.css';

const SmallButton = ({ children, onClick, variant = 'neutral', title, className = '', style = {}, ...rest }) => {
  const cls = `small-btn small-btn-${variant} ${className}`.trim();
  return (
    <button className={cls} onClick={onClick} title={title} style={style} {...rest}>
      {children}
    </button>
  );
};

export default SmallButton;
