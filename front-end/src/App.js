import React, { useState, useEffect, useCallback , createContext } from 'react'; // Import useState and useEffect
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapPage from './components/MapPage';
import './css/navBar.css';
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
import './index.css';
import './css/tutorialComponent.css'

export const TutorialContext = createContext(); // create context for tutorial that is shared between all pages

function App() {
  const [isLoading, setIsLoading] = useState(true); 
  const [firstTime, setFirstTime] = useState(localStorage.getItem('isFirst')); // check if it is the first time the user is using the app
  const [tutorialIndex, setTutorialIndex] = useState(0); // keep track which pages has been clicked on the tutorial
  const [tutorialOn, setTutorialOn] = useState(false); // if tutorial is on
  useEffect(() => {
    localStorage.getItem('isFirst') == 'false' ? setFirstTime('false') : setFirstTime('true'); 
    //get a list of all local storage items, for debugging purposes
    const localStorageItems = {};
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let value = localStorage.getItem(key);
        localStorageItems[key] = value;
    }
    setTimeout(() => {
      if(firstTime == 'true' || firstTime == null || firstTime == 'null'){
        console.log('<--------First time user detected-------->')
        console.log('Initializing local storage items...');
        localStorage.setItem('isFirst', false); // set first time to false
      }
      else{
        console.log('<--------Returning user detected-------->')
        console.log('Local storage items:');
        console.log(localStorageItems);
      }
      setIsLoading(false);
    }, 3000);
    
    
    window.addEventListener('keydown', devTools); // add button press even listeners for dev tools

     // if first time is null, set it to true

  }, []);

    useEffect(() => {
      firstTime == 'true' ? setTutorialOn(true) : setTutorialOn(false);
  }, [firstTime]);

  const devTools = (e) => {
    switch (e.keyCode) {
      case 82: //press r to reset local storage
        console.log('Resetting local storage...');
        localStorage.clear();
        break;
    }
  };

  return (
    <TutorialContext.Provider value={{tutorialIndex, setTutorialIndex, firstTime, setFirstTime, tutorialOn, setTutorialOn}}> {/* Share the context without passing the prop to each page */  }
      <div onKeyDown={devTools}>
        <BrowserRouter>
        {!isLoading && tutorialOn && <TutorialComponent />}
          {isLoading && <LoadingScreen />} {/* Putting the loading component here so that loading screen appears when refreshing as well */}
          {!isLoading && <NavBar />}  {/* Hides navbar when loading */}
          <Routes>
            <Route path="/" element={<LoadingScreen />} /> {/*Goes to loading on app boot*/}
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
        </BrowserRouter>
      </div>
    </TutorialContext.Provider>
  );
}

export default App;
