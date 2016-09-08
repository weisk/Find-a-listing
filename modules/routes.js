import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './App/';
import Home from './Home/';
import Map from './Map/';

export default (
    <Route path="/" component={App}>
        <IndexRoute component={Home} />
        <Route path="/map" component={Map} />
    </Route>
);
