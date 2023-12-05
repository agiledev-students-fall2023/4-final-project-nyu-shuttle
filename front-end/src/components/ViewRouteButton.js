import '../css/routesSubpage.css';
import { Link } from 'react-router-dom';
function ViewRouteButton () {
    return (
        <>        
        <div className="view-route-button">
            <Link to="/saved-routes">
                <button>View Route</button>
            </Link>
        </div>
        </>


        
    )
}

export default ViewRouteButton;