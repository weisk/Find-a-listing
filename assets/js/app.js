/* global window, navigator */
import '_leaflet.scss';
import directions from 'directions';
import { getNearest, getWithin } from 'heritageList';
import { map } from 'map';
import { userlocation, getCurrentPosition } from 'navigator';
import mapboxgl, { LngLatBounds, util } from 'mapbox-gl';
import turf from '@turf/turf';
import { decode } from 'geobuf';
import Pbf from 'pbf';
import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';

// _map is a predefined variable for Directions()
/* eslint-disable no-underscore-dangle */
directions._map = map;
/* eslint-endable no-underscore-dangle */

window.directions = directions;

map.on('load', () => {
    const listedBuildingsPbf = '/bin/data/dist/listedBuildings.pbf';
    util.getArrayBuffer(listedBuildingsPbf, (er, data) => {
        const listedBuildings = decode(new Pbf(data));

        listedBuildings.features.forEach((item) => {
            const feature = item;
            let marker = 'marker';
            if (feature.properties.riskId !== undefined) {
                marker = 'fire-station';
            }
            feature.properties = Object.assign({}, feature.properties, {
                marker,
                'marker-size': '11',
            });
            return feature;
        });

        map.addSource('listedbuildings', {
            type: 'geojson',
            data: listedBuildings,
            cluster: true,
        });

        map.addLayer({
            id: 'listedbuildings-unclustered-points',
            type: 'symbol',
            source: 'listedbuildings',
            layout: {
                'icon-image': '{marker}-{marker-size}',
            },
        });

        const layers = [
            [150, '#f28cb1'],
            [20, '#f1f075'],
            [0, '#51bbd6'],
        ];

        layers.forEach((layer, i) => {
            map.addLayer({
                id: `cluster-${i}`,
                type: 'circle',
                source: 'listedbuildings',
                paint: {
                    'circle-color': layer[1],
                    'circle-radius': 18,
                },
                filter: i === 0 ?
                    ['>=', 'point_count', layer[0]] :
                    ['all',
                        ['>=', 'point_count', layer[0]],
                        ['<', 'point_count', layers[i - 1][0]]],
            });
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'listedbuildings',
            layout: {
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
            const coordinates = userlocation.geometry.coordinates;

            coordinates[0] = crd.longitude;
            coordinates[1] = crd.latitude;

            const userlocationBuffer = turf.buffer(userlocation, crd.accuracy, 'meters');
            const userlocationFeature = turf.featureCollection([userlocationBuffer]);

            map.flyTo({
                center: coordinates,
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
                id: 'userlocationbuffer',
                source: 'userlocationbuffer',
                type: 'fill',
                paint: {
                    'fill-color': '#0092ff',
                    'fill-opacity': 0.15,
                },
            });

            map.addLayer({
                id: 'userlocation',
                source: 'userlocation',
                type: 'circle',
                paint: {
                    'circle-radius': 5,
                    'circle-color': '#0092ff',
                },
            });

            getWithin(userlocation, listedBuildings, 200, 'meters', (assets, count) => {
                const searchRadius = 200;
                const unit = 'meters';
                let msg;

                if (count > 1) {
                    msg = `There are ${count} heritage assets within ${searchRadius} ${unit}`;
                } else if (count === 1) {
                    msg = `There is ${count} heritage asset within ${searchRadius} ${unit}`;
                } else {
                    msg = `There are no heritage assests within ${searchRadius} ${unit}`;
                }

                console.log(msg);
            });

            getNearest(userlocation, listedBuildings, (asset, distance, unit) => {
                const building = asset;
                const buildingname = building.properties.name;
                const userCoords = userlocation.geometry.coordinates;
                const assetCoords = building.geometry.coordinates;
                const newbounds = new LngLatBounds(userCoords, assetCoords);
                const consoleString = `The nearest heritage asset is ${buildingname},
                                                     which is ${distance} ${unit} away from your
                                                     current location`;

                console.log(consoleString);

                building.properties['marker-size'] = '15';

                map.getSource('listedbuildings').setData(listedBuildings);

                map.fitBounds(newbounds, {
                    padding: 120,
                });

                directions.setOrigin(userCoords);
                directions.setDestination(assetCoords);
            });
        });

        const historicenglandLayers = {
            layers: [
                'listedbuildings-unclustered-points',
            ],
        };

        map.on('click', (event) => {
            const point = event.point;
            const features = map.queryRenderedFeatures(point, historicenglandLayers);

            if (!features.length) {
                return;
            }

            const feature = features[0];

            map.flyTo({
                center: feature.geometry.coordinates,
                zoom: 17,
            });

            const popup = new mapboxgl.Popup();
            popup.setLngLat(map.unproject(point));
            popup.setHTML(feature.properties.listEntry);
            popup.addTo(map);
        });

        map.on('mousemove', (event) => {
            const features = map.queryRenderedFeatures(event.point, historicenglandLayers);
            map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
        });
    });
});
