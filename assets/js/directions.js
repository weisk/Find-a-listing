import Directions from 'mapbox-gl-directions';
import { duration } from 'moment';
import { decode } from 'polyline';

const directions = new Directions({
    unit: 'meters',
    profile: 'walking',
    container: 'directions',
});

/**
 * Decode polyline coordinates
 * @param  {string} coordinates - encoded Polyline coordinates
 * @return {[array]} decoded Polyline coordinates
 */
function decodeCoords(coordinates) {
    const decoded = decode(coordinates, 6);
    decoded.map(coords => coords.reverse());
    return decoded;
}

directions.on('route', (direction) => {
    // _map is a predefined variable for Directions()
    /* eslint-disable no-underscore-dangle */
    const map = directions._map;
    /* eslint-endable no-underscore-dangle */
    const geometry = direction.route[0].geometry;
    const summary = direction.route[0].summary;

    const coordinates = decodeCoords(geometry);

    const data = {
        type: 'Feature',
        properties: {
            summary,
        },
        geometry: {
            type: 'LineString',
            coordinates,
        },
    };

    map.addSource('directions', {
        type: 'geojson',
        data,
    });

    map.addLayer({
        id: 'route',
        type: 'line',
        source: 'directions',
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
        },
        paint: {
            'line-color': '#fafafa',
            'line-width': 3,
        },
    });

    const routeDuration = direction.route[0].duration;
    const moment = duration(routeDuration, 'seconds').humanize();
    const consoleString = `It will take approx. ${moment} to walk
                                         to the nearest heritage asset`;
    console.log(consoleString);
});

export { directions as default };
