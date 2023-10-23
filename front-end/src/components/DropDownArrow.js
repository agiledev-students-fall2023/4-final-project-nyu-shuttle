
import { ReactComponent as FilterIcon } from '../images/filter.svg';
import '../css/filter.css'
import { useState, useEffect } from 'react';

function DropDownArrow ({status , arrowColor}) {
    console.log(status)
    const [isOpen, setIsOpen] = useState(status);
    useEffect(() => {
        setIsOpen(status);
    }, [status])

    return (
        <>
            <FilterIcon className={`absolute right-0 my-4 mx-5 opacity-60 transform transition duration-300 ${isOpen ? 'rotate-180' : ''}`} fill={arrowColor} width="13" height="13" aria-label="Filter" />
        </>
    )

}

export default DropDownArrow;