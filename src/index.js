import React from 'react';
import ReactDOM from 'react-dom';


import $ from "jquery";
import 'jquery-ui';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/effect';
import 'jquery-ui/ui/effects/effect-shake';

import format from 'string-format';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'xterm/dist/xterm.css';
import './index.css';

import App from './app/app';
import * as serviceWorker from './serviceWorker';

import * as util from './util';

// Setup AJAX defaults
$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
    if (!options.url.startsWith('http://') && !options.url.startsWith('https://')) {
        // Prefix URL with base if necessary
        options.url = util.getFullUrlForPath(options.url);
    } else {
        // console.log('url: ', options.url);
    }

    if (options.url !== '/api/token') {
        var token = localStorage.getItem('access_token');
        if (token) {
            // console.log('setting access token to ajax request');
            jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);

        } else {
            console.log('no token available ...');
        }
    }
});

$.ajaxSetup({
    dataType: 'json',
    contentType: 'application/json',
    processData: false,
    timeout: 2000,
    beforeSend: function(jqXHR, options) {
        if (options.contentType === "application/json" && typeof options.data != "string") {
            options.data = JSON.stringify(options.data);
        }
    }
});


// Enable string formatting
format.extend(String.prototype, {});


// Render render render
ReactDOM.render(
    <App />, 
    document.getElementById('root')
);





// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
