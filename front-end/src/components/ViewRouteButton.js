import '../css/routesPage.css';
import { Link } from 'react-router-dom';
function ViewRouteButton () {
    return (
        <>        
        <div className="view-route-button">
            <Link to="/saved-routes">
                <button>Saved Routes</button>
            </Link>
        </div>
        </>
    )
}

export default ViewRouteButton;