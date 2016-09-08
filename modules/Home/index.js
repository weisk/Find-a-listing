/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import Icon from '../Icon';

export default class App extends Component {
    static displayName = 'App';

    render() {
        return (
            <section className="home">
                <p>Hello World!</p>
                <Icon />
            </section>
        );
    }
}
