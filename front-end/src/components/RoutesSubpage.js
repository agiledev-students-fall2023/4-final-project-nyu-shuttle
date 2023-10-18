import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import map from '../images/subpage_map.png'

function RoutesSubpage() {
  const { location1, location2 } = useParams();
  const navigate = useNavigate();

  const goBack = () => {
    navigate("/routes"); 
  };

  return (
    <div>
      <button onClick={goBack}>Back</button>
      <h1>Route</h1>
      <img src={map} alt="My Image" />
      <p>Location 1: {location1}</p>
      <p>Location 2: {location2}</p>
    </div>
  );
}

export default RoutesSubpage;
