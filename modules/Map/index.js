/* global window */
import React, { Component, PropTypes } from 'react';
import autobind from 'autobind-decorator';
import MapGL, { fitBounds } from 'react-map-gl';

import './Map.scss';

const ukBounds = [
    [3.2667631034264275, 58.952806871160476],
    [-11.706150066966075, 49.46629330841651],
];
const uk = fitBounds(500, 500, ukBounds);

export default class Map extends Component {
    static displayName = 'Map';

    static defaultProps = {
        width: 500,
        height: 500,
        mapStyle: 'mapbox://styles/domjt/cisz3ax13004q2xr0shaq4r8c',
        mapboxApiAccessToken: process.env.mapboxKey,
    }

    static propTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        mapStyle: PropTypes.string.isRequired,
        onChangeViewport: PropTypes.func,
        mapboxApiAccessToken: PropTypes.string.isRequired,
    }

    state = {
        viewport: {
            latitude: uk.longitude,
            longitude: uk.latitude,
            zoom: uk.zoom,
        },
    }

    @autobind
    onChangeViewport(viewport) {
        if (this.props.onChangeViewport) {
            return this.props.onChangeViewport(viewport);
        }
        return this.setState({ viewport });
    }

    render() {
        const mapProps = {
            ...this.state.viewport,
            ...this.props,
            onChangeViewport: this.onChangeViewport,
        };
        return (
            <div className="mapContainer">
                <MapGL {...mapProps} />
            </div>
        );
    }
}
