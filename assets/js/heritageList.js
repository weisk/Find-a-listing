/* eslint-disable */
import { nearest, distance, buffer, featureCollection, within } from '@turf/turf';
import { getJSON } from 'jquery';

const fs = require('fs');
const path = require('path');

export function getData(file, success) {
    getJSON(file, success);
}

export function getNearest(pointA, pointB, success) {
    const asset = nearest(pointA, pointB);
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

export function getWithin(pointA, data, searchDistance = 500, unit = 'meters', success) {
    const pointBuffer = buffer(pointA, searchDistance, unit);
    const pointFeature = featureCollection([pointBuffer]);
    const assets = within(data, pointFeature);

    success(assets, assets.features.length);
}
