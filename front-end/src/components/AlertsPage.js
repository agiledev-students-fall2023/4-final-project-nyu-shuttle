import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/alertsPage.css';

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const fetchAlerts = () => {
    // axios
    //   .get(`${process.env.REACT_APP_SERVER_HOSTNAME}/fetchAlerts`)
    //   .then((response) => {
    //     // axios bundles up all response data in response.data property
    //     const alerts = response.data.alerts;
    //     setAlerts(alerts);
    //   })
    //   .catch((err) => {
    //     setError(err);
    //   })
    //   .finally(() => {
    //     // the response has been received, so remove the loading icon
    //     setLoaded(true);
    //   });

    // Only for DEMO remove later
    setAlerts([
      {
        title: 'Alert Title A',
        content:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Arcu bibendum at varius vel pharetra vel turpis nunc. Suscipit adipiscing bibendum est ultricies integer. Turpis nunc eget lorem dolor.',
      },
      {
        title: 'Alert Title B',
        content:
          'Bibendum est ultricies integer quis. Diam maecenas ultricies mi eget mauris pharetra et ultrices neque.',
      },
      {
        title: 'Alert Title C',
        content:
          'Sit amet porttitor eget dolor morbi non arcu risus quis. Quis blandit turpis cursus in hac habitasse platea. Pellentesque elit eget gravida cum sociis natoque penatibus et.',
      },
      { title: 'Alert Title D', content: 'Eu feugiat pretium nibh ipsum consequat nisl.' },
    ]);
    // --------------------------
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="alerts-container">
      <h1 className="alerts-header">Alerts</h1>
      <div className="alerts-content">
        <div className="alerts-item-wrapper">
          {alerts.map((alert, index) => (
            <div key={index} className="alerts-item">
              <h3 className="font-semibold text-xl">{alert.title}</h3>
              <p>{alert.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AlertsPage;
