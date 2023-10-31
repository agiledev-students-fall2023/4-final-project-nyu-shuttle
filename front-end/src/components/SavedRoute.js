import { Link } from 'react-router-dom';
import '../css/settingsPage.css';

const SavedRoute = ({ savedRoute }) => {
  return (
    <>
      {/* Link should be targeting the actual routes page, etc. Currently just # */}
      <Link className="settings-item routes" to={`#?from=${savedRoute.from}&to=${savedRoute.to}`}>
        <h2 className="font-semibold">{savedRoute.name}</h2>
        <span className="text-sm">From: {savedRoute.from}</span>
        <span className="text-sm">To: {savedRoute.to}</span>
      </Link>
    </>
  );
};

export default SavedRoute;
