import '../css/navBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapLocationDot, faRoute, faCircleExclamation, faGears } from '@fortawesome/sharp-light-svg-icons'
function NavBar() {
    return (
        <>
            <div className="navBar">
                <div className="button">
                <FontAwesomeIcon icon={faMapLocationDot} size="lg" className='mx-1'/>                    
                    <p>Map</p>
                </div>
                <div className="button">
                    <FontAwesomeIcon icon={faRoute} size="lg" className='mx-1'/>
                    <p>Routes</p>
                </div>
                <div className="button">
                    <FontAwesomeIcon icon={faCircleExclamation} size="lg" className='flex mx-1'/>
                    <p className="flex">Alerts</p>
                </div>
                <div className="button">
                    <FontAwesomeIcon icon={faGears} size="lg" className='mx-1'/>
                    <p>Settings</p>
                </div>
            </div>
        </>
    )
}

export default NavBar;