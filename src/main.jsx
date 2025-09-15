import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import App from './global/app.jsx';
import Home from './components/home/home.jsx';
import Members from './components/members/members.jsx';
import Persons from './components/person/persons.jsx';
import ViewTree from './components/familyTree/ViewTree.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="members" element={<Members />} />
          <Route path="persons" element={<Persons />} />
          <Route path="viewtree" element={<ViewTree />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
