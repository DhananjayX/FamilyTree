import React from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../common/featurecard.jsx';
import Button from '../common/button.jsx';
import homelabels from '../../labels/homelabels.js';

function Home() {
  const navigate = useNavigate();

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
              route={feature.route}
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
                </div>
      </div>
    </main>
  );
}

export default Home;
