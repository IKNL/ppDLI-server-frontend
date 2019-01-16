import React, { Component } from 'react';
import Icon from 'react-icons-kit';
import {
    circle
} from 'react-icons-kit/fa';

import $ from "jquery";

import './node.css';

class Node extends Component {

    constructor(props) {
        super(props);

        this.state = {
            access_token: localStorage.getItem('access_token')
        };
    }

    updateState(ctx) {
        $.get({
            url: '/api/stats'
        }).done(function(data) {
            ctx.setState({
                'collaborations': data.collaborations
            });
        });
    }

    componentDidMount() {
        var socket = this.props.socket;
        var ctx = this;

        if (socket) {
            socket.on('connect', function() {
                socket.on("node-status-changed", function(data) {
                    console.log('node-status-changed', data);
                    ctx.updateState(ctx);
                });            
            });

            this.updateState(this);            
        }
    }

    renderNode(node) {
        var status;

        if (node.status === 'offline') {
            status = <span className='small right red'><Icon icon={circle} /></span>
        } else {
            status = <span className='small right green'><Icon icon={circle} /></span>
        }

        return(
            <div key={node.id}>
                <span className="small">{node.organization.name}</span>
                {status}
            </div>
        )
    }

    renderCollaboration(collaboration) {
        var nodes = [];
        for (var idx in collaboration.nodes) {
            nodes.push(this.renderNode(collaboration.nodes[idx]));
        }

        return(
            <div key={collaboration.id} className="dashboard-collaboration">
                <h4>{collaboration.name}</h4>
                {nodes}
            </div>
        )
    }

    render() {
        const collaborations = this.state.collaborations;
        var rc = [];

        for (var idx in collaborations) {
            rc.push(this.renderCollaboration(collaborations[idx]));
        }

        return(
            <div className="Node">
                <div className="header">
                    Collaborations
                </div>
                <div>{rc}</div>
            </div>
        );
    }
}

// Exports
export default Node;
export {
    Node
};