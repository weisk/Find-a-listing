import { nearest, distance, buffer, featureCollection, within } from '@turf/turf';

/**
 * Find the nearest object within the data source to pointA
 *
 * @param  {array} pointA - Coordinates to search from
 * @param  {Object} pointB - GeoJSON source to search
 * @param  {function} success - success
 * @returns {Object} - null
 */
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

/**
 * Find objects within a radius of pointA
 * @param  {Array} pointA - pointA
 * @param  {Object} data - GeoJSON data
 * @param  {number} searchDistance - searchDistance
 * @param  {string} unit - unit
 * @param  {function} success - success
 * @returns {Object} - null
 */
export function getWithin(pointA, data, searchDistance = 500, unit = 'meters', success) {
    const pointBuffer = buffer(pointA, searchDistance, unit);
    const pointFeature = featureCollection([pointBuffer]);
    const assets = within(data, pointFeature);

    success(assets, assets.features.length);
}
