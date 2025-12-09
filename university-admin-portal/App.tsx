import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import StatsDashboard from './pages/StatsDashboard';
import ResearchersDirectory from './pages/ResearchersDirectory';
import ResearcherProfile from './pages/ResearcherProfile';
import ResearcherForm from './pages/ResearcherForm';
import PublicationsManagement from './pages/PublicationsManagement';
import PublicationDetails from './pages/PublicationDetails';
import PublicationForm from './pages/PublicationForm';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<StatsDashboard />} />
          
          {/* Researchers Routes */}
          <Route path="researchers" element={<ResearchersDirectory />} />
          <Route path="researchers/add" element={<ResearcherForm mode="add" />} />
          <Route path="researchers/:id" element={<ResearcherProfile />} />
          <Route path="researchers/:id/edit" element={<ResearcherForm mode="edit" />} />
          
          {/* Publications Routes */}
          <Route path="publications" element={<PublicationsManagement />} />
          <Route path="publications/add" element={<PublicationForm mode="add" />} />
          <Route path="publications/:id" element={<PublicationDetails />} />
          <Route path="publications/:id/edit" element={<PublicationForm mode="edit" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
