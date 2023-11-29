import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/settingsPage.css';

const PrivacyPolicyPage = () => {
  return (
    <div className="fixed">
    <div className="settings-container">
      <Link className="settings-item" to="/settings">
        &lt; Settings
      </Link>
      <div>
        <h1 className="settings-header">Privacy Policy</h1>
      </div>
      <div className="privacypolicy-content">
        <p>Last Updated: [28/11/2023]</p>
        <br></br>
        <p>
          Thank you for choosing the NYU Shuttle App. This Privacy Policy outlines how we collect, use, and store information when you use our app.
        </p>
        <br></br>
        <h2>Information We Collect</h2>
        <br></br>
        <p>
          The NYU Shuttle App does not require any login or password, and we do not collect personal information such as your name, email address, or contact details. We also do not store information about your routes or location.
        </p>
        <br></br>
        <h2>Local Storage</h2>
        <br></br>
        <p>
          The NYU Shuttle App utilizes local storage on your device to save preferences and settings. The only information stored is your deviceID which is used to identify your device and provide you with a personalized experience. This information is not shared with any third parties.
        </p>
        <br></br>
        <h2>Cookies</h2>
        <br></br>
        <p>
          We do not use cookies or similar tracking technologies in the NYU Shuttle App.
        </p>
        <br></br>
        <h2>Third-Party Services</h2>
        <br></br>
        <p>
          The NYU Shuttle App does not integrate with any third-party services that collect personal information.
        </p>
        <br></br>
        <h2>Data Security</h2>
        <br></br>
        <p>
          We take reasonable measures to protect the information stored locally on your device. However, please be aware that no method of transmission over the internet or electronic storage is entirely secure, and we cannot guarantee the absolute security of your data.
        </p>
        <br></br>
        <h2>Changes to the Privacy Policy</h2>
        <br></br>
        <p>
          We may update this Privacy Policy from time to time. Any changes will be reflected on this page with the updated date.
        </p>
        <br></br>
        <h2>Contact Us</h2>
        <br></br>
        <p>
          If you have any questions or concerns about our Privacy Policy, please reach out to us at ?@nyu.edu.
        </p>
        <br></br>
        <p>
          By using the NYU Shuttle App, you agree to the terms outlined in this Privacy Policy.
        </p>
        <br></br>
      </div>
    </div>
    </div>
  );
};

export default PrivacyPolicyPage;
