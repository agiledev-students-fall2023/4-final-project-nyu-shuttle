import { useState } from 'react';
import '../css/filter.css'
import { ReactComponent as FilterIcon } from '../images/filter.svg';
import DropDownArrow from './DropDownArrow.js';

function Filter(){
    /*the routes are temperarily hard-coded */
    const routes = ['None', 'Route 1', 'Route 2', 'Route 3', 'Route 4', 'Route 5', 'Route 6', 'Route 7', 'Route 8', 'Route 9', 'Route 10'];
    const [isOpen, setIsOpen] = useState(false);
    //randomly route colors
    const routes_colors = ['#F0E9FF', '#f5429b', '#e04502', '#a1f542', '#162fcc', '#16cc71', '#a142f5', '#cc1631', '#f54278', '#e6cc0e', '#f54278', '#60f542']
    const [selectedRoutes, setSelectedRoutes] = useState('Filter');
    const [routeColor, setRouteColor] = useState('white');
    const [textColor, setTextColor] = useState('black');

    const toggleFilter = () => {
        if (!isOpen) {
            setRouteColor('#F0E9FF'); //reset color to default when filter is opened again
        }
        setIsOpen(!isOpen);
    }
    const selectRoute = (route) => {
        route = route == 'None' ? 'Filter' : route; /*Set text to 'filter' if no route is selected*/
        setSelectedRoutes(route);
        setTextColor( (route!='Filter') ? 'white' : 'black' ); //change text color
        let routeIndex = routes.indexOf(route);
        setRouteColor(routes_colors[routeIndex]);
    }

    return(
        <>
            <div className="filter-container">
                <div className={`filter ${isOpen ? 'open' : 'closed'}`} style={{backgroundColor : routeColor, color : textColor}} onClick={toggleFilter}>
                    {isOpen ? <></> : 
                        <span className="flex px-3 py-2 pt-3">
                            <h2 id="filter-text" className='ml-2 text-sm'>{selectedRoutes}</h2>
                        </span> 
                    }
                    <DropDownArrow status={isOpen} arrowColor={textColor} />
                    <ul id="dropdown"  style={{display: isOpen ? 'block' : 'none'}}> 
                        {routes.map((route, index) => (
                            <div className="flex ">
                                <div className='route-color-bar' style={{backgroundColor:routes_colors[index] }}></div>
                                <div className="list-item-wrapper" onClick={() => selectRoute(route)}><li key={index}>{route}</li></div>
                            </div>
                        ))}
                    </ul>
                    
                </div>
            </div>
        </>
    )
}

export default Filter;