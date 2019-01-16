import React, { Component } from 'react';

import { Clock } from '../clock/clock';

import './nav-footer.css';


class NavFooter extends Component {
    render() {
        return(
            <div className="NavFooter">
                <span className="right">
                    <Clock />
                </span>
            </div>
        ) 
    }
}

// Exports
export default NavFooter;
export {
    NavFooter
};