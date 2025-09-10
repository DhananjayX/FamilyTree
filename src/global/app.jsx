import React from 'react';
import { Outlet } from 'react-router-dom';
import './app.css';
import './base.css';
import Header from './header.jsx';
import Footer from './footer.jsx';
import homelabels from '../labels/homelabels.js';

function App() {
  return (
    <div className="app">
      <Header 
        title={homelabels.headerData.title} 
        subtitle={homelabels.headerData.subtitle} 
      />
      
      <Outlet />
      
      <Footer 
        text={homelabels.footerData.text}
        year={homelabels.footerData.year}
      />
    </div>
  );
}

export default App;
