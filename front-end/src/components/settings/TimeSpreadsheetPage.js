import { Link } from 'react-router-dom';
import '../../css/settingsPage.css';

const TimeSpreadsheetPage = () => {
  return (
    <div className="settings-container">
      <Link className="settings-item" to="/settings">
        &lt; Settings
      </Link>
      <div>
        <h1 className="settings-header">Time Spreadsheets</h1>
      </div>
      <div className="settings-item-wrapper">
        <div className="settings-item">
          <span className="font-semibold">Route A</span>
          <a href="https://docs.google.com/spreadsheets/d/1jlRme7S0vBssLcbZlQTjP5QrHtV0Cj02jMydXN_7E2I/edit#gid=1331793628">Mon-Thu</a>
          <a href="https://docs.google.com/spreadsheets/d/1K3P2W9DLbVoe8b6p-ZApdBU9vlvZnGYdp6NvETO6FvA/edit#gid=763110812">Fri</a>
          <a href="https://docs.google.com/spreadsheets/d/10wPPDsXBkyeVqvQVrBO7rqN-ERzOucR0hAWzA7N1nCU/edit#gid=703898394">Sat/Sun</a>
        </div>
        <div className="settings-item">
          <span className="font-semibold">Route B</span>
          <a href="https://docs.google.com/spreadsheets/d/1RFcpF009PyBT-E-FlfidOWe0Zi5n2mVD-dk988QiSoM/edit#gid=1450224670">Mon-Thu</a>
          <a href="https://docs.google.com/spreadsheets/d/1d7qcHrb5-Wm_ozU2QHnFgnyrmG9g3JosG-T6pe1sf6g/edit#gid=1376082178">Fri</a>
          <h2 className="text-m mr-9">NS</h2>
        </div>
        <div className="settings-item">
          <span className="font-semibold">Route C</span>
          <a href="https://docs.google.com/spreadsheets/d/1sI19tog5q2HvD62v8WK5mbz8gC4mPqxLwsLPDkcGgj4/edit#gid=957095352">Mon-Thu</a>
          <h2 className="text-m">NS</h2>
          <h2 className="text-m mr-9">NS</h2>
        </div>
        <div className="settings-item">
          <span className="font-semibold">Route E</span>
          <a href="https://docs.google.com/spreadsheets/d/1shK20dC2NbZu87IAejKz6AG3Bylm8DUKZjoqBIUsipQ/edit#gid=1909168798">Mon-Thu</a>
          <a href="https://docs.google.com/spreadsheets/d/1a-heAL-fVzz7VQN_Fyn1kTH4SrKqiziXa4lnXpBGOSU/edit#gid=355259140">Fri</a>
          <h2 className="text-m mr-9">NS</h2>
        </div>
        <div className="settings-item">
          <span className="font-semibold">Route F</span>
          <a href="https://docs.google.com/spreadsheets/d/17gwe1E9PG4UuvL8boBFrmZKo-fmi7js-3CBF771CYSk/edit#gid=119295668">Mon-Thu</a>
          <h2 className="text-m">NS</h2>
          <h2 className="text-m mr-9">NS</h2>
        </div>
        <div className="settings-item">
          <span className="font-semibold">Route G</span>
          <a href="https://docs.google.com/spreadsheets/d/17gwe1E9PG4UuvL8boBFrmZKo-fmi7js-3CBF771CYSk/edit#gid=119295668">Mon-Thu</a>
          <h2 className="text-m">NS</h2>
          <h2 className="text-m mr-9">NS</h2>
        </div>
        <div className="settings-item">
          <span className="font-semibold">Route W</span>
          <h2 className="text-m mr-4">NS</h2>
          <h2 className="text-m ">NS</h2>
          <a className="mr-3" href="https://docs.google.com/spreadsheets/d/1ri820ZdZNSj0nxnaCfzaczsjY0ALORGRMnUXt23QMNE/edit#gid=1304245022">Sat/Sun</a>
        </div>
      </div>
    </div>
  );
};

export default TimeSpreadsheetPage;
