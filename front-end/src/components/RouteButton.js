import { useState, useEffect } from 'react';
function RouteButton({ route }) {
    const [color, setColor] = useState('rgba(0, 0, 0, 0)');
    function hexToRGBA(hex, alpha) {
        if (hex === undefined) {
          return 'rgba(0, 0, 0, 0)'; // return transparent color if hex is undefined
        }
        let r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);
    
        if (alpha) {
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
            return `rgb(${r}, ${g}, ${b})`;
        }
    }
    
    useEffect(() => {
      setColor(hexToRGBA(route.color, 0.5));
    }, [route.color]);
  
    return (
      <button className="w-20 h-20" style={{ backgroundColor: color }}>
        {route.name}
      </button>
    );
  }

export default RouteButton;