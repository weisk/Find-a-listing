/* global window, navigator */
import mapboxgl, { Map } from 'mapbox-gl';
import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';

/* eslint-disable max-len */
mapboxgl.accessToken = 'pk.eyJ1IjoiZG9tanQiLCJhIjoiY2lzNTM0aW90MDAxMzJ1bmZkOWU5ZHdqaiJ9.ZJTAzeB-kGyLv71rkxaRPw';
/* eslint-enable max-len */
window.mapboxgl = mapboxgl;

export const ukBounds = [
    [3.2667631034264275, 58.952806871160476],
    [-11.706150066966075, 49.46629330841651],
];

export const maxUkBounds = [
    [31.825531880508805, 63.41060241161475],
    [-82.7124846629315, 23.765434280835365],
];

const map = new Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [-2.23001, 54.314072],
    zoom: 4.7,
    minZoom: 4.7,
    maxBounds: maxUkBounds,
});

map.on('load', () => {
    map.fitBounds(ukBounds);
});

export { map };
