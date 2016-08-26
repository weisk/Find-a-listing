/* global navigator */
/* eslint-disable */
import mapboxgl, { Map, Geolocate, LngLatBounds } from 'mapbox-gl';
import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';
import '_leaflet.scss';
import { getCurrentPosition } from 'navigator';
import turf from '@turf/turf';

const fs = require('fs');
const path = require('path');

const listedBuildings = JSON.parse(fs.readFileSync(path.join(__dirname, '../../bin/data/HAR/HAR-listed-buildings.geojson'), 'utf8'));

mapboxgl.accessToken = `pk.eyJ1IjoiZG9tanQiLCJhIjoiY2lzNTM0aW90MDAxMzJ1bmZkOWU5ZHdqaiJ9.ZJTAzeB-kGyLv71rkxaRPw`;

const ukBounds = [
    [3.2667631034264275, 58.952806871160476],
    [-11.706150066966075, 49.46629330841651],
];

const maxUkBounds = [
    [31.825531880508805, 63.41060241161475],
    [-82.7124846629315, 23.765434280835365],
];

const userlocation = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [0, 0],
    },
};

const map = new Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [-2.23001, 54.314072],
    zoom: 4.7,
    minZoom: 4.7,
    maxBounds: maxUkBounds,
});
window.map = map;

listedBuildings.features.forEach((feature) => {
        const marker = {
            marker: 'marker',
            'marker-size': '11',
        };
        feature.properties = Object.assign({}, feature.properties, marker);
});

map.on('load', () => {
    map.fitBounds(ukBounds);

    map.addSource('listedBuildings', {
        type: 'geojson',
        data: listedBuildings,
        cluster: true,
    });

    map.addLayer({
        'id': 'unclustered-points',
        'type': 'symbol',
        'source': 'listedBuildings',
        'layout': {
            'icon-image': '{marker}-{marker-size}'
        },
    });

    // Display the earthquake data in three layers, each filtered to a range of
    // count values. Each range gets a different fill color.
    var layers = [
        [150, '#f28cb1'],
        [20, '#f1f075'],
        [0, '#51bbd6']
    ];

    layers.forEach(function (layer, i) {
        map.addLayer({
            'id': 'cluster-' + i,
            'type': 'circle',
            'source': 'listedBuildings',
            'paint': {
                'circle-color': layer[1],
                'circle-radius': 18
            },
            'filter': i === 0 ?
                ['>=', 'point_count', layer[0]] :
                ['all',
                    ['>=', 'point_count', layer[0]],
                    ['<', 'point_count', layers[i - 1][0]]]
        });
    });

    // Add a layer for the clusters' count labels
    map.addLayer({
        'id': 'cluster-count',
        'type': 'symbol',
        'source': 'listedBuildings',
        'layout': {
            'text-field': '{point_count}',
            'text-font': [
                'DIN Offc Pro Medium',
                'Arial Unicode MS Bold'
            ],
            'text-size': 12
        }
    });

    getCurrentPosition((pos) => {
        const crd = pos.coords;
        userlocation.geometry.coordinates[0] = crd.longitude;
        userlocation.geometry.coordinates[1] = crd.latitude;

        const userlocationBuffer = turf.buffer(userlocation, crd.accuracy, 'meters');
        const userlocationFeature = turf.featureCollection([userlocationBuffer]);

        map.flyTo({
            center: userlocation.geometry.coordinates,
            zoom: 15,
        });

        console.log('Your current position is:');
        console.log(crd);

        map.addSource('userlocation', {
            type: 'geojson',
            data: userlocation,
        });

        map.addSource('userlocationbuffer', {
            type: 'geojson',
            data: userlocationFeature,
        });

        map.addLayer({
            'id': 'userlocationbuffer',
            'source': 'userlocationbuffer',
            'type': 'fill',
            'paint': {
                'fill-color': '#0092ff',
                'fill-opacity': 0.15,
            }
        });

        map.addLayer({
            'id': 'userlocation',
            'source': 'userlocation',
            'type': 'circle',
            'paint': {
                'circle-radius': 5,
                'circle-color': '#0092ff'
            }
        });
    });

    const groupName = '';
    const historicenglandLayers = {
        layers: [
            'unclustered-points',
            // `${groupName}listedBuildings`,
            // `${groupName}scheduledMonuments`,
            // `${groupName}parksAndGardens`,
            // `${groupName}listedBuildingsAtRisk`,
            // `${groupName}battlefields`,
            // `${groupName}wreckAtRisk`,
            // `${groupName}areasAtRisk`,
            // `${groupName}worldHeritageSites`,
            // 'userlocation',
        ],
    };

    map.on('click', function (e) {
        const features = map.queryRenderedFeatures(e.point, historicenglandLayers);

        if (!features.length) {
            return;
        }

        const feature = features[0];

        // Populate the popup and set its coordinates
        // based on the feature found.
        console.log(feature);
        console.log(feature.geometry.coordinates[1]);
        map.flyTo({
            center: feature.geometry.coordinates,
            zoom: 17,
        });

        const popup = new mapboxgl.Popup()
            .setLngLat(map.unproject(e.point))
            .setHTML(feature.properties.ListEntry)
            .addTo(map);
    });

    // Use the same approach as above to indicate that the symbols are clickable
    // by changing the cursor style to 'pointer'.
    map.on('mousemove', function (e) {
        const features = map.queryRenderedFeatures(e.point, historicenglandLayers);
        map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
    });

});
window.turf = turf;
window.getNearestBuilding = () => {
    var nearestListedBuilding = turf.nearest(userlocation, listedBuildings);
    const dis = turf.distance(userlocation, nearestListedBuilding, 'miles');
    nearestListedBuilding.properties['marker-size'] = '15';
    const buildingname = nearestListedBuilding.properties.Published_;
    map.getSource('listedBuildings').setData(listedBuildings);
    const userlocationBuffer = turf.buffer(userlocation, 500, 'meters');
    const userlocationFeature = turf.featureCollection([userlocationBuffer]);
    const closelistedbuildings = turf.within(listedBuildings, userlocationFeature);
    console.log(closelistedbuildings);
    const newbounds = new LngLatBounds(userlocation.geometry.coordinates, nearestListedBuilding.geometry.coordinates);
    map.fitBounds(newbounds, {
        padding: 120,
    });
    console.log(`There are ${closelistedbuildings.features.length} listed buildings near you. The nearest listed building is ${buildingname}, which is ${Math.round(dis * 10) / 10} miles away from your current location`);
}
/* eslint-enable */
export { map as default };
