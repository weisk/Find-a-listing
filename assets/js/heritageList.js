/* eslint-disable */
import { nearest, distance, buffer, featureCollection, within } from '@turf/turf';

const fs = require('fs');
const path = require('path');

export const listedBuildings = JSON.parse(fs.readFileSync(path.join(__dirname, '../../bin/listedBuildings.geojson'), 'utf8'));

export function getNearest(pointA, success) {
    const asset = nearest(pointA, listedBuildings);
    let unit = 'miles';
    let assetDistance = distance(pointA, asset, unit);
    let roundedDistance = Math.round(assetDistance * 10) / 10;

    if (roundedDistance < 0.2) {
        unit = 'meters';
        assetDistance = distance(pointA, asset, unit);
        roundedDistance = Math.round(assetDistance);
    }

    success(asset, roundedDistance, unit);
}

export function getWithin(pointA, searchDistance = 500, unit = 'meters', success) {
    const pointBuffer = buffer(pointA, searchDistance, unit);
    const pointFeature = featureCollection([pointBuffer]);
    const assets = within(listedBuildings, pointFeature);

    success(assets, assets.features.length);
}
