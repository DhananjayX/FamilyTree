import React from 'react';
import { useNavigate } from 'react-router-dom';
import './featurecard.css';

const FeatureCard = ({ icon, title, description, route, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (route) {
      navigate(route);
    }
  };

  const isClickable = onClick || route;

  return (
    <div 
      className={`feature-card ${isClickable ? 'feature-card-clickable' : ''}`}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FeatureCard;
