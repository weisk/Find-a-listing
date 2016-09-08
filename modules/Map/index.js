import React, { Component, PropTypes } from 'react';
import autobind from 'autobind-decorator';
import MapGL from 'react-map-gl';

export default class Map extends Component {
    static displayName = 'Map';

    static defaultProps = {
        width: 250,
        height: 250,
        mapStyle: 'mapbox://styles/mapbox/satellite-v9',
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
            latitude: 37.7577,
            longitude: -122.4376,
            zoom: 11,
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
            <MapGL
              {...mapProps}
            />
        );
    }
}
