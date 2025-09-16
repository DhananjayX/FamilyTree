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
    } else if (index === 2) { // "Timeline" feature
      navigate('/upcoming');
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
        <div className="more-button-container" style={{ display: 'flex', gap: 12 }}>
          <Button 
            variant="primary" 
            onClick={() => navigate('/persons')}
          >
            More...
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/viewtree')}
          >
            View Tree
          </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/upcoming')}
            >
              Timeline
            </Button>
        </div>
      </div>
    </main>
  );
}

export default Home;
