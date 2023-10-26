import React, { useEffect } from "react";
import "../css/loadingScreen.css";
import ImageLogo from "../images/bus_svg.svg";
import { useNavigate } from "react-router-dom";
import LoadingGif from "../images/loading-gif.gif"

const LoadingScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const delay = 3000;
    const timeoutId = setTimeout(() => {
      navigate("/map");
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <div className="App">
      <div className="logo">
        <img src={ImageLogo} alt="Shuttle Bus Logo" className="App-logo" />
      </div>
      <h1 className="app-name">NYU Shuttle</h1>
      <div className = "loading-effect">
        <img src= {LoadingGif} alt="Loading Gif" className="loading-gif" />
      </div>
    </div>
  );
};

export default LoadingScreen;
