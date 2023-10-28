import '../css/navBar.css'
import { ReactComponent as MapIcon } from '../images/map.svg';
import { ReactComponent as AlertIcon } from '../images/alert.svg';
import { ReactComponent as RouteIcon } from '../images/route.svg';
import { ReactComponent as SettingIcon } from '../images/gears.svg';
import { useState, useEffect , useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TutorialContext } from '../App';

function NavBar() {
    const [navBarState, setNavBarState] = useState('Map');
    const {tutorialIndex, setTutorialIndex, firstTime, setFirstTime} = useContext(TutorialContext); // index of the tutorial page
    const navigate = useNavigate();
    const handleClick = (iconName) => {
        setNavBarState(iconName);
    }

    useEffect(() => {
    }, []);

    useEffect(() => {
        let overlay = document.getElementsByClassName('overlay')[0];
        let cur = document.getElementById(navBarState);
        if (cur.classList.contains('inactive')) { // when a inactive icon is clicked
            document.getElementsByClassName('active')[0].classList.add('inactive');
            document.getElementsByClassName('active')[0].classList.remove('active');
            cur.classList.remove('inactive');
            cur.classList.add('active');
            switch(navBarState) { //change the functionalities of each button here
                case 'Map':
                    overlay.style.left = '-36%'; //shifts the overlay
                    navigate('/map')
                    break;
                case 'Routes':
                    overlay.style.left = '-12%';
                    navigate('/routes')
                    break;
                case 'Alerts':
                    overlay.style.left = '12%';
                    navigate('/alerts')
                    break;
                case 'Settings':
                    overlay.style.left = '36%';
                    navigate('/settings')
                    break;
            }
        }
    }, [navBarState]);

    return (
        <>
            <div className="navBar">
                <div className="backdrop"></div>
                <div className="overlay"></div>
                <div className="active" id="Map" onClick={() => handleClick('Map')}>
                    <MapIcon fill='#F0E9FF' width="25" height="25" aria-label="Map" />
                    <p>Map</p>
                </div>
                <div className="inactive" id="Routes" onClick={() => handleClick('Routes')}>
                    <RouteIcon width="25" height="25" aria-label="Routes" />
                    <p>Routes</p>
                </div>
                <div className="inactive" id="Alerts" onClick={() => handleClick('Alerts')}>
                    <AlertIcon width="25" height="25" aria-label="Alerts" />
                    <p className="flex">Alerts</p>
                </div>
                <div className="inactive" id="Settings" onClick={() => handleClick('Settings')}>
                    <SettingIcon width="25" height="25" aria-label="Settings" />
                    <p>Settings</p>
                </div>
            </div>
        </>
    );
}





export default NavBar;