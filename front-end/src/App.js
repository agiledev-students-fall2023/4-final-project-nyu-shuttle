import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import MapPage from "./components/MapPage";
import "./css/navBar.css";
import NavBar from "./components/NavBar";
import RoutesPage from "./components/RoutesPage";
import RoutesSubpage from "./components/RoutesSubpage";
import SettingsPage from "./components/SettingsPage";
import AlertsPage from "./components/AlertsPage";

function App() {
  return (
    <>
      <BrowserRouter>
      <NavBar />
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/routes/:location1/:location2"
            element={<RoutesSubpage />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
