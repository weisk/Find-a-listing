/* global window */
import '../scss/_leaflet.scss';
import directions from './directions';
import { map } from './map';
import { loadData } from './listedBuildings';

// _map is a predefined variable for Directions()
/* eslint-disable no-underscore-dangle */
directions._map = map;
/* eslint-endable no-underscore-dangle */

window.directions = directions;

map.on('load', () => {
    loadData();
});
