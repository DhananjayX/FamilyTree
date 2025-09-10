import React from 'react';
import './featurecard.css';

const FeatureCard = ({ icon, title, description, onClick }) => {
  return (
    <div 
      className={`feature-card ${onClick ? 'feature-card-clickable' : ''}`}
      onClick={onClick}
    >
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FeatureCard;
