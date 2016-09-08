import React, { Component, PropTypes } from 'react';
import MapGL from 'react-map-gl';

export default class Map extends Component {
    static displayName = 'Map';

    static defaultProps = {
        mapboxApiAccessToken: process.env.mapboxKey,
    }

    static propTypes = {
        mapboxApiAccessToken: PropTypes.string.isRequired,
    }

    state = {
        viewport: {
            latitude: 37.7577,
            longitude: -122.4376,
            zoom: 11,
        },
    }

    render() {
        return (
            <MapGL
              {...this.state.viewport}
              {...this.props}
            />
        );
    }
}
