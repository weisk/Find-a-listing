/* eslint-disable */
/* global navigator */
export const geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};

function getCurrentPositionError(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
}

export function getCurrentPosition(success, error = getCurrentPositionError, options = geolocationOptions) {
    navigator.geolocation.getCurrentPosition(success, error, options);
}
