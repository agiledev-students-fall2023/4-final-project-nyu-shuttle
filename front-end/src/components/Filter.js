import { useState, Fragment, useEffect } from 'react';
import '../css/filter.css';
// import { ReactComponent as FilterIcon } from '../images/filter.svg';
import DropDownArrow from './DropDownArrow.js';

function Filter() {
  const rs = window.nyushuttle.routesSelected;
  const [routesData, setRoutesFilter] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('Show All');
  const [routeColor, setRouteColor] = useState('white');
  const [textColor, setTextColor] = useState('black');

  useEffect(() => {
    initializeFilter();
    loadPrevFilter();
  }, []);

  const initializeFilter = () => {
    setRoutesFilter([{ name: 'Show All', color: 'black' }]);
    const routesArray = Object.keys(window.nyushuttle.routes).map((key) => {
      const route = window.nyushuttle.routes[key];
      return {
        id: key,
        name: route[0],
        color: route[1],
      };
    });
    setRoutesFilter((defaultArray) => [...defaultArray, ...routesArray]);
  };

  const loadPrevFilter = () => {
    if (rs && rs.length) {
      const route = window.nyushuttle.routes[rs[0]];
      setSelectedRoute(route[0]);
      setTextColor('white');
      setRouteColor(route[1]);
    }
  };

  const toggleFilter = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // When opening the dropdown
      setSelectedRoute('Show All');
      setRouteColor('white');
      setTextColor('black');
    }
  };

  const selectRoute = (id, routeName, color) => {
    if (routeName === 'Show All' || routeName === 'None') {
      setSelectedRoute('Show All');
      setTextColor('black');
      setRouteColor('white');
      window.nyushuttle.routesSelected = [];
    } else {
      setSelectedRoute(routeName);
      setTextColor('white');
      setRouteColor(color);
      window.nyushuttle.routesSelected = [id];
    }
  };

  return (
    <>
      <div className="filter-container">
        <div
          className={`filter ${isOpen ? 'open' : 'closed'}`}
          style={{ backgroundColor: routeColor, color: textColor }}
          onClick={toggleFilter}
        >
          {!isOpen && (
            <span className="flex pl-3 py-2 pt-3 items-center">
              <h2 id="filter-text" className="px-2 text-sm">
                {selectedRoute}
              </h2>
            </span>
          )}
          <DropDownArrow status={isOpen} arrowColor={textColor} />

          <ul id="dropdown" style={{ display: isOpen ? 'block' : 'none' }}>
            {routesData.map((route, index) => (
              <Fragment key={index}>
                <div className="flex bg-white">
                  <div className="route-color-bar" style={{ backgroundColor: route.color }}></div>
                  <div className="list-item-wrapper" onClick={() => selectRoute(route.id, route.name, route.color)}>
                    <li>{route.name}</li>
                  </div>
                </div>
              </Fragment>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Filter;
