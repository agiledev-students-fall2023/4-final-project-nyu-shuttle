import '../css/mapPage.css'
import mapImage from '../images/subpage_map.png'
import Filter from './Filter';
function MapPage() {
    return (
        <>
            <div className="map-container">
                <Filter />
                <div className="map">
                    <img src={mapImage} style={{ objectFit: 'cover', width: '100%', height: '100%' }} alt="NYC MAP" />
                </div>
            </div>
        </>
    )
}

export default MapPage;