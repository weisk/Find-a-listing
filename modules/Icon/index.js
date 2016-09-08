/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import './Icon.scss';

export default class Icon extends Component {
    static displayName = 'Icon';

    render() {
        return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              data-icon="test"
              viewBox="0 0 50 50"
            />
        );
    }
}
