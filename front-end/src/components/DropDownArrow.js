import { ReactComponent as FilterIcon } from '../images/filter.svg';
import '../css/filter.css';
import { useState, useEffect } from 'react';

function DropDownArrow({ status, arrowColor }) {
  const [isOpen, setIsOpen] = useState(status);
  useEffect(() => {
    setIsOpen(status);
  }, [status]);

  return (
    <>
      <FilterIcon
        className={`filterIcon ${isOpen ? 'open' : 'closed'}`}
        fill={arrowColor}
        width="13"
        height="13"
        aria-label="Filter"
      />
    </>
  );
}

export default DropDownArrow;
