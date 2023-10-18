import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapPage from "./components/MapPage";
import "./css/navBar.css";
import NavBar from "./components/NavBar";
import RoutesPage from "./components/RoutesPage";
import RoutesSubpage from "./components/RoutesSubpage";

function App() {
  return (
    <>
      <NavBar />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/routes" element={<RoutesPage />} />
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
