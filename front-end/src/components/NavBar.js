import '../css/navBar.css'
import mapIcon from '../images/map.svg'
import alertIcon from '../images/alert.svg'
import routeIcon from '../images/route.svg'
import settingIcon from '../images/gears.svg'
function NavBar() {
    return (
        <>
            <div className="navBar">
                <div className="button">
                <img src={mapIcon} width="25" height="25" alt="Map" />          
                    <p>Map</p>
                </div>
                <div className="button">
                <img src={routeIcon} width="25" height="25" alt="Map" />

                    <p>Routes</p>
                </div>
                <div className="button">
                <img src={alertIcon} width="25" height="25" alt="Map" />
                    <p className="flex">Alerts</p>
                </div>
                <div className="button">
                <img src={settingIcon} width="25" height="25" alt="Map" />

                    <p>Settings</p>
                </div>
            </div>
        </>
    )
}

export default NavBar;