import React from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../common/featurecard.jsx';
import Button from '../common/button.jsx';
import homelabels from '../../labels/homelabels.js';

function Home() {
  const navigate = useNavigate();

  const handleFeatureClick = (index) => {
    if (index === 0) { // "Your Family Members" is the first feature
      navigate('/members');
    }
  };

  return (
    <main className="app-main">
      <div className="container">          
        <div className="feature-grid">
          {homelabels.featuresData.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              onClick={index === 0 ? () => handleFeatureClick(index) : undefined}
            />
          ))}
        </div>          
        <div className="more-button-container">
          <Button 
            variant="primary" 
            onClick={() => console.log("More clicked")}
          >
            More...
          </Button>
        </div>
      </div>
    </main>
  );
}

export default Home;
