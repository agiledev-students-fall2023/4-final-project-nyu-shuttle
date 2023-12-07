import { useState, useEffect } from 'react';
import { queryAlert } from '../utils/alerts';
import '../css/alertsPage.css';

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const fetchAlerts = () => {
    queryAlert(true).then((messages) => {
      setAlerts(messages);
      setLoaded(true);
      // if alerts are loaded, remove the loading icon (if any)
    });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="alerts-container">
      <h1 className="alerts-header">Alerts</h1>
      <div className="alerts-content">
        <div className="alerts-item-wrapper">
          {alerts && alerts.length ? (
            alerts.map((alert) => (
              <div key={alert.id} className="alerts-item">
                <span className="time">{alert.createdF}</span>
                <div className="headertext">{alert.gtfsAlertHeaderText}</div>
                <p>{alert.gtfsAlertDescriptionText}</p>
              </div>
            ))
          ) : (
            <div>There is no alert</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertsPage;
