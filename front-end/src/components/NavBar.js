import '../css/navBar.css'
import { ReactComponent as MapIcon } from '../images/map.svg';
import { ReactComponent as AlertIcon } from '../images/alert.svg';
import { ReactComponent as RouteIcon } from '../images/route.svg';
import { ReactComponent as SettingIcon } from '../images/gears.svg';
import { useState, useEffect } from 'react';

function NavBar({ overlayOffset = "-36%" }) {
    const [navBarState, setNavBarState] = useState('Map');

    const handleClick = (iconName) => {
        setNavBarState(iconName);

    }

    useEffect(() => {
        console.log(navBarState)
        let overlay = document.getElementsByClassName('overlay')[0];
        let cur = document.getElementById(navBarState);
        if (cur.classList.contains('inactive')) { // when a inactive icon is clicked
            document.getElementsByClassName('active')[0].classList.add('inactive');
            document.getElementsByClassName('active')[0].classList.remove('active');
            cur.classList.remove('inactive');
            cur.classList.add('active');
            switch(navBarState) {
                case 'Map':
                    overlay.style.left = '-36%';
                    break;
                case 'Routes':
                    overlay.style.left = '-12%';
                    break;
                case 'Alerts':
                    overlay.style.left = '12%';
                    break;
                case 'Settings':
                    overlay.style.left = '36%';
                    break;
            }
        }
        console.log(cur.classList)
        
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