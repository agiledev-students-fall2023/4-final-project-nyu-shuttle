import { Link } from 'react-router-dom';
import '../../css/settingsPage.css';

const PrivacyPolicyPage = () => {
  return (
    <div className="settings-container">
      <Link className="settings-item" to="/settings">
        &lt; Settings
      </Link>
      <div>
        <h1 className="settings-header">Privacy Policy</h1>
      </div>
      <div className="privacypolicy-content">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Arcu ac tortor dignissim convallis aenean et tortor. Mollis aliquam ut porttitor leo a. Dictum
          varius duis at consectetur lorem donec massa sapien faucibus. Interdum posuere lorem ipsum dolor sit amet
          consectetur adipiscing. Lacus vestibulum sed arcu non odio euismod lacinia. Nibh nisl condimentum id
          venenatis. Nisl purus in mollis nunc sed id semper risus in.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
