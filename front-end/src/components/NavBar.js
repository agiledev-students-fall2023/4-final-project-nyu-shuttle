import '../css/navBar.css';
import { ReactComponent as MapIcon } from '../images/map.svg';
import { ReactComponent as AlertIcon } from '../images/alert.svg';
import { ReactComponent as RouteIcon } from '../images/route.svg';
import { ReactComponent as SettingIcon } from '../images/gears.svg';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TutorialContext } from '../App';
import '../css/tutorialComponent.css';
import TutorialComponent from './TutorialComponent';

function NavBar() {
  const getPath = () => window.location.pathname.split('/')[1] || 'map';
  const [navigationState, setnavigationState] = useState(getPath());
  const { tutorialIndex, setTutorialIndex, firstTime, setFirstTime, tutorialOn, setTutorialOn } =
    useContext(TutorialContext);
  const navigate = useNavigate();
  const handleClick = (iconName) => {
    setnavigationState(iconName);
  };

  const updateNavBarDisplay = (to) => {
    const overlay = document.getElementsByClassName('overlay')[0];
    const cur = document.getElementById(to);
    if (cur.classList.contains('inactive')) {
      // when a inactive icon is clicked
      document.getElementsByClassName('active')[0].classList.add('inactive');
      document.getElementsByClassName('active')[0].classList.remove('active');
      cur.classList.remove('inactive');
      cur.classList.add('active');

      //change the functionalities of each button here
      switch (to) {
        case 'map':
          overlay.style.left = '-36%'; //shifts the overlay
          break;
        case 'routes':
          overlay.style.left = '-12%';
          break;
        case 'alerts':
          overlay.style.left = '12%';
          break;
        case 'settings':
          overlay.style.left = '36%';
          break;
      }
    }
  };

  useEffect(() => {
    updateNavBarDisplay(navigationState);
    if (navigationState !== getPath()) {
      navigate('/' + navigationState);
    }
  }, [navigationState]);

  return (
    <>
      <div className="navBar">
        <div className="backdrop"></div>
        <div className="overlay"></div>
        <div className="active" id="map" onClick={() => handleClick('map')}>
          <MapIcon fill="#F0E9FF" width="25" height="25" aria-label="Map" />
          <p>Map</p>
        </div>
        <div className="inactive" id="routes" onClick={() => handleClick('routes')}>
          <RouteIcon width="25" height="25" aria-label="Routes" />
          <p>Routes</p>
        </div>
        <div className="inactive" id="alerts" onClick={() => handleClick('alerts')}>
          <AlertIcon width="25" height="25" aria-label="Alerts" />
          <p className="flex">Alerts</p>
        </div>
        <div className="inactive" id="settings" onClick={() => handleClick('settings')}>
          <SettingIcon width="25" height="25" aria-label="Settings" />
          <p>Settings</p>
        </div>
      </div>
    </>
  );
}

export default NavBar;
