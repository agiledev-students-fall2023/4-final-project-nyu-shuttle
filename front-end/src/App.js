import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapPage from "./components/MapPage";
import "./css/navBar.css"
import NavBar from "./components/NavBar"
import RoutesPage from "./components/RoutesPage"

function App() {
  return (
    <>
    <NavBar />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/routes" element={<RoutesPage />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
