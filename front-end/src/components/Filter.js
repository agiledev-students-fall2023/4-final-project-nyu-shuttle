import '../css/filter.css'
function Filter(){
    /*the routes are temperarily hard-coded */
    const openFilter = () => {
        let filter = document.getElementsByClassName('filter')[0];
        let options = document.getElementById('dropdown');
        if (filter.classList.contains('closed')) {
            filter.classList.remove('closed');
            filter.classList.add('open');
            options.style.display = 'block';
            document.getElementById('filter-text').style.display = 'none';
        } else {
            filter.classList.remove('open');
            filter.classList.add('closed');
            options.style.display = 'none';
            document.getElementById('filter-text').style.display = 'block';
        }
    }
    return(
        <>
            <div className="filter-container">
                <div className="filter closed" onClick={openFilter}>
                    <h2 id="filter-text" className='m-2 mx-auto'>Filter</h2>
                    <ul id="dropdown"> 
                        <li>Route 1</li>
                        <li>Route 2</li>
                        <li>Route 3</li>
                        <li>Route 4</li>
                        <li>Route 5</li>
                        <li>Route 6</li>
                        <li>Route 7</li>
                        <li>Route 8</li>
                        <li>Route 9</li>
                        <li>Route 10</li>
                    </ul>
                    
                </div>
            </div>
        </>
    )
}

export default Filter;