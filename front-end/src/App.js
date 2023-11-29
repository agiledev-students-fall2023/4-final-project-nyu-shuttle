import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import components
import MapPage from './components/MapPage';
import NavBar from './components/NavBar';
import RoutesPage from './components/RoutesPage';
import RoutesSubpage from './components/RoutesSubpage';
import AlertsPage from './components/AlertsPage';
import SettingsPage from './components/settings/SettingsPage';
import SavedRoutesPage from './components/SavedRoutesPage';
import TimeSpreadsheetPage from './components/settings/TimeSpreadsheetPage';
import FeedbackSupportPage from './components/settings/FeedbackSupportPage';
import PrivacyPolicyPage from './components/settings/PrivacyPolicyPage';
import LoadingScreen from './components/LoadingScreen';
import TutorialComponent from './components/TutorialComponent';


// Import hooks and utilities
import { registerService } from './utils/serviceRegister';
import { getUserPos, loadGoogleMapsAPI } from './utils/mapUtility';

// Import CSS
import './index.css';
import './css/navBar.css';
import './css/tutorialComponent.css';

export const TutorialContext = createContext();

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const isFirstTimeUser = localStorage.getItem('isFirst') !== 'false';
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const [tutorialOn, setTutorialOn] = useState(isFirstTimeUser);
  const localStorageItems = {};
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    let value = localStorage.getItem(key);
    localStorageItems[key] = value;
   //console.log(key, value)
  }

  useEffect(() => {
    initializeLocalStorage(isFirstTimeUser);
    loadGoogleMapsAPI(() => setIsLoading(false));
    window.addEventListener('keydown', devTools);
    registerService();
    getUserPos();

    return () => window.removeEventListener('keydown', devTools);
  }, []);

  const initializeLocalStorage = (isFirstTime) => {
    if (isFirstTime) {
      console.log('<--------First time user detected-------->');
      console.log('Initializing local storage items...');
      localStorage.setItem('isFirst', false);
    } else {
      console.log('<--------Returning user detected-------->');
      console.log('Local storage items:', localStorageItems);
    }
  };

  const devTools = (e) => {
    if ((e.keyCode === 82 && e.metaKey) || (e.keyCode === 82 && e.ctrlKey)){
      console.log('Resetting local storage...');
      localStorage.clear();
    }
  };

  return (
    <TutorialContext.Provider value={{ tutorialIndex, setTutorialIndex, tutorialOn, setTutorialOn }}>
      <div onKeyDown={devTools}>
        <BrowserRouter>
          {!isLoading && tutorialOn && <TutorialComponent />}
          {isLoading && <LoadingScreen />} {!isLoading && <NavBar />} {/* Hides navbar when loading */}
          {!isLoading && (
            <Routes>
              <Route path="/" element={<MapPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/saved-routes" element={<SavedRoutesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/view-schedule" element={<TimeSpreadsheetPage />} />
              <Route path="/settings/feedback-support" element={<FeedbackSupportPage />} />
              <Route path="/settings/privacypolicy" element={<PrivacyPolicyPage />} />
              <Route path="/routes/:location1/:location2" element={<RoutesSubpage />} />
            </Routes>
          )}
        </BrowserRouter>
      </div>
    </TutorialContext.Provider>
  );
}

export default App;
