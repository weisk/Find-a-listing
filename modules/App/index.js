/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import './App.scss';

export default class App extends Component {
    static displayName = 'App';

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}
