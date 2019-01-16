import React, { Component } from 'react';

import {
    FormGroup, Label, 
    Input
} from 'reactstrap';

import './nav-header.css';


class NavHeader extends Component {

    render() {
        var {handleRenderChange} = this.props;

        return(
            <div className="NavHeader">
                <span>user: <b>{this.props.username}</b></span>

                <span className="logout">
                    <button 
                        className="btn btn-warning btn-sm"
                        onClick={this.props.onLogout}
                        >
                        logout
                    </button>
                </span>

                {/*
                <span style={{float: 'right', marginRight: '30px'}}>
                    <FormGroup check inline>
                        <Label check>
                            <Input type="checkbox" checked={render} onChange={handleRenderChange} />&nbsp;Render
                        </Label>
                    </FormGroup>
                </span>
                */}
            </div>
        ) 
    }
}

// Exports
export default NavHeader;
export {
    NavHeader
};