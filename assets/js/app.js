/* global navigator */
/* eslint-disable */
import mapboxgl, { Map, Geolocate, LngLatBounds, util } from 'mapbox-gl';
import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';
import '_leaflet.scss';
import { getCurrentPosition } from 'navigator';
import turf from '@turf/turf';
import { getData, getNearest, getWithin } from 'heritageList';
import Directions from 'mapbox-gl-directions';
import { decode } from 'polyline';
import moment from 'moment';
import geobuf from 'geobuf';
import Pbf from 'pbf';

mapboxgl.accessToken = `pk.eyJ1IjoiZG9tanQiLCJhIjoiY2lzNTM0aW90MDAxMzJ1bmZkOWU5ZHdqaiJ9.ZJTAzeB-kGyLv71rkxaRPw`;
window.mapboxgl = mapboxgl;

let listedBuildings;

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

const directions = new Directions({
  unit: 'metric',
  profile: 'walking',
  container: 'directions',
});

directions._map = map;

directions.on('route', (direction) => {
    console.log('Direction object:');
    console.log(direction);

    const routeGeoJSON = {
        type: 'Feature',
        properties: {
            summary: direction.route[0].summary,
        },
        geometry: {
            type: 'LineString',
            coordinates: decode(direction.route[0].geometry, 6).map((c) => {
                return c.reverse();
            }),
        },
    };

    map.addSource('directions', {
        type: 'geojson',
        data: routeGeoJSON,
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

    const consoleString = `It will take approx. ${moment.duration(direction.route[0].duration, 'seconds').humanize()} to walk to the nearest heritage asset`;
    console.log(consoleString);
    document.querySelector('.mapSidebar').innerHTML += `<p>${consoleString}</p>`;
});

map.on('load', () => {
    console.log('map load');
    map.fitBounds(ukBounds);

    util.getArrayBuffer('/bin/data/dist/listedBuildings.pbf', (er, data) => {
        listedBuildings = geobuf.decode(new Pbf(data));
        listedBuildings.features.forEach((feature) => {
            const markerIcon = (feature.properties.riskId !== undefined) ? 'fire-station' : 'marker';
            // console.log(markerIcon);
            const marker = {
                marker: markerIcon,
                'marker-size': '11',
            };
            feature.properties = Object.assign({}, feature.properties, marker);
        });
        map.addSource('HARlistedbuildings', {
            type: 'geojson',
            data: listedBuildings,
            cluster: true,
        });

        map.addLayer({
            'id': 'HARlistedbuildings-unclustered-points',
            'type': 'symbol',
            'source': 'HARlistedbuildings',
            'layout': {
                'icon-image': '{marker}-{marker-size}',
            },
        });

        // Display the earthquake data in three layers, each filtered to a range of
        // count values. Each range gets a different fill color.
        var layers = [
            [150, '#f28cb1'],
            [20, '#f1f075'],
            [0, '#51bbd6'],
        ];

        layers.forEach(function (layer, i) {
            map.addLayer({
                'id': 'cluster-' + i,
                'type': 'circle',
                'source': 'HARlistedbuildings',
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
            'source': 'HARlistedbuildings',
            'layout': {
                'text-field': '{point_count}',
                'text-font': [
                    'DIN Offc Pro Medium',
                    'Arial Unicode MS Bold',
                ],
                'text-size': 12,
            },
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

            getWithin(userlocation, listedBuildings, 200, 'meters', (assets, count) => {
                const searchRadius = 200;
                const unit = 'meters';
                if (count > 1) {
                    const consoleString = `There are ${count} heritage assets within ${searchRadius} ${unit}`;
                    console.log(consoleString);
                    document.querySelector('.mapSidebar').innerHTML += `<p>${consoleString}</p>`;
                } else if (count === 1) {
                    const consoleString = `There is ${count} heritage asset within ${searchRadius} ${unit}`;
                    console.log(consoleString);
                    document.querySelector('.mapSidebar').innerHTML += `<p>${consoleString}</p>`;
                } else {
                    const consoleString = `There are no heritage assests within ${searchRadius} ${unit}`;
                    console.log(consoleString);
                    document.querySelector('.mapSidebar').innerHTML += `<p>${consoleString}</p>`;
                }
            });

            getNearest(userlocation, listedBuildings, (asset, distance, unit) => {
                const buildingname = asset.properties.name;
                asset.properties['marker-size'] = '15';
                map.getSource('HARlistedbuildings').setData(listedBuildings);

                const newbounds = new LngLatBounds(userlocation.geometry.coordinates, asset.geometry.coordinates);
                map.fitBounds(newbounds, {
                    padding: 120,
                });
                const consoleString = `The nearest heritage asset is ${buildingname}, which is ${distance} ${unit} away from your current location`;
                console.log(consoleString);
                document.querySelector('.mapSidebar').innerHTML += `<p>${consoleString}</p>`;
                directions.setOrigin(userlocation.geometry.coordinates);
                directions.setDestination(asset.geometry.coordinates);
            });
        });

        const groupName = '';
        const historicenglandLayers = {
            layers: [
                'HARlistedbuildings-unclustered-points',
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
            map.flyTo({
                center: feature.geometry.coordinates,
                zoom: 17,
            });

            const popup = new mapboxgl.Popup()
                .setLngLat(map.unproject(e.point))
                .setHTML(feature.properties.listEntry)
                .addTo(map);
        });

        // Use the same approach as above to indicate that the symbols are clickable
        // by changing the cursor style to 'pointer'.
        map.on('mousemove', function (e) {
            const features = map.queryRenderedFeatures(e.point, historicenglandLayers);
            map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
        });
    });
});

/* eslint-enable */
export { map as default };
