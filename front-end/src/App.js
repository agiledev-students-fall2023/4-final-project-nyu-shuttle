import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import MapPage from './components/MapPage';
import './css/navBar.css';
import NavBar from './components/NavBar';
import RoutesPage from './components/RoutesPage';
import RoutesSubpage from './components/RoutesSubpage';
import AlertsPage from './components/AlertsPage';
import SettingsPage from './components/settings/SettingsPage';
import SavedRoutesPage from './components/settings/SavedRoutesPage';
import TimeSpreadsheetPage from './components/settings/TimeSpreadsheetPage';
import FeedbackSupportPage from './components/settings/FeedbackSupportPage';
import PrivacyPolicyPage from './components/settings/PrivacyPolicyPage';

import './index.css';

function App() {
  return (
    <>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/saved-routes" element={<SavedRoutesPage />} />
          <Route path="/settings/view-schedule" element={<TimeSpreadsheetPage />} />
          <Route path="/settings/feedback-support" element={<FeedbackSupportPage />} />
          <Route path="/settings/privacypolicy" element={<PrivacyPolicyPage />} />

          <Route path="/routes/:location1/:location2" element={<RoutesSubpage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
