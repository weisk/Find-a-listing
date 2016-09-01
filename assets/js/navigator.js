/* global navigator */
export const userlocation = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [0, 0],
    },
};

export const geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};

/**
 * Error catch for getCurrentPosition
 *
 * @param  {Object} error - Error object
 * @return {Object} - null
 */
function getCurrentPositionError(error) {
    console.warn(`ERROR ${error.code}: ${error.message}`);
}

/**
 * Wrapper for navigator getCurrentPosition
 *
 * @param  {function} success - success
 * @param  {function} error - error catch function
 * @param  {Object} options - Settings for navigator
 * @return {Object} - Current location details
 */
export function getCurrentPosition(
    success,
    error = getCurrentPositionError,
    options = geolocationOptions
) {
    navigator.geolocation.getCurrentPosition(success, error, options);
}
