import { useState, useEffect, useCallback } from 'react';
import '../css/filter.css';
// import { ReactComponent as FilterIcon } from '../images/filter.svg';
import DropDownArrow from './DropDownArrow.js';

function Filter() {
  const [routesData, setRoutesFilter] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('Show All');
  const [routeColor, setRouteColor] = useState('white');
  const [textColor, setTextColor] = useState('black');
  const nyushuttle = window.nyushuttle;

  const initializeRoutes = useCallback(() => {
    const routesArray = Object.keys(nyushuttle.routes).map((key) => {
      const route = nyushuttle.routes[key];
      return { id: key, name: route[0], color: route[1] };
    });
    setRoutesFilter([...[{ name: 'Show All', color: 'black' }], ...routesArray]);
  }, [nyushuttle.routes]);

  const loadPreviousFilter = useCallback(() => {
    const routesSelected = nyushuttle.routesSelected;
    if (routesSelected && routesSelected.length) {
      const route = nyushuttle.routes[routesSelected[0]] || ['Show All', 'white'];
      setSelectedRoute(route[0]);
      setTextColor('white');
      setRouteColor(route[1]);
    }
  }, [nyushuttle.routes, nyushuttle.routesSelected]);

  useEffect(() => {
    initializeRoutes();
    loadPreviousFilter();
  }, [initializeRoutes, loadPreviousFilter]);

  const toggleFilter = useCallback(() => {
    setIsOpen((prevIsOpen) => {
      if (!prevIsOpen) {
        setSelectedRoute('Show All');
        setRouteColor('white');
        setTextColor('black');
      }
      return !prevIsOpen;
    });
  }, []);

  const selectRoute = useCallback(
    (id, routeName, color) => {
      setSelectedRoute(routeName);
      setTextColor(routeName === 'Show All' || routeName === 'None' ? 'black' : 'white');
      setRouteColor(routeName === 'Show All' || routeName === 'None' ? 'white' : color);
      nyushuttle.routesSelected = routeName === 'Show All' || routeName === 'None' ? [] : [id];
    },
    [nyushuttle.routesSelected]
  );

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
            {routesData.map((route) => (
              <div key={route.id} className="flex bg-white">
                <div className="route-color-bar" style={{ backgroundColor: route.color }}></div>
                <div className="list-item-wrapper" onClick={() => selectRoute(route.id, route.name, route.color)}>
                  <li>{route.name}</li>
                </div>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Filter;
