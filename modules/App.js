import React, { Component } from 'react'

export default class App extends Component {
    static displayName = 'App';

    render() {
        return (
            <div>
                <h1>React Router</h1>
                {this.props.children}
            </div>
        )
    }
};
