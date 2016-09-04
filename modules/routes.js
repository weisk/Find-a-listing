import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './App';
import Map from './Map';

export default (
    <Route path="/" component={App}>
        <IndexRoute component={Map} />
        <Route path="/map" component={Map} />
    </Route>
);
