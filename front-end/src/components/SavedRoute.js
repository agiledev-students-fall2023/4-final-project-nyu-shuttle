import { Link } from 'react-router-dom';
import '../css/savedRoutes.css';



const SavedRoute = ({ savedRoute }) => {
  return (
    <>
      <Link className="settings-item routes" to={`/routes/${savedRoute.from.name}
      /${savedRoute.from.address}/${savedRoute.to.name}/${savedRoute.to.address}`}>
        <h2 className="font-semibold">{savedRoute.name}</h2>
        <span className="text-sm">From: {savedRoute.from.name}</span>
        <span className="text-sm">To: {savedRoute.to.name}</span>
      </Link>
    </>
  );
};

export default SavedRoute;
