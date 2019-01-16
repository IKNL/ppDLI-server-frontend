import React, { Component } from 'react';
import {
    Row, Col
} from 'reactstrap';

import io from 'socket.io-client';

import * as util from '../util';
import { NavHeader } from '../nav-header/nav-header';
import { NavFooter } from '../nav-footer/nav-footer';
import { Node } from '../node/node';
import { Log } from '../log/log';
import { Terminal } from '../terminal/terminal';
import { Globe } from '../globe/encom';

import './dashboard.css';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.app = props.app;

        var token = localStorage.getItem('access_token');
        this.socket_options = {
          transportOptions: {
            polling: {
              extraHeaders: {
                Authorization: "Bearer " + token
              }
            }
          }
        };

        var host = util.getBaseURL(false) + '/admin';
        console.log(host);

        // Terminal.applyAddon(fit);

        this.state = {
            admin_socket: io.connect(host, this.socket_options),
            animate_globe: true
        };

        this.handleRenderChange = this.handleRenderChange.bind(this);
    };

    handleRenderChange(evt) {
        this.setState({animate_globe: evt.target.checked});
    }

    componentDidMount() {
        var socket = this.state.admin_socket;

        socket.on('error', (error) => {
            console.log('error: ', error);
            this.app.onLogout();
        });

        socket.on('connect_error', (error) => {
            console.log('connect_error: ', error);
            // this.app.onLogout();
        });

        socket.on('disconnect', (reason) => {
            console.log('disconnect: ', reason);
            alert(reason);
        });
    };

    render() {
        var nodes = {
            taiwan: {
                lat: 120.9605,
                lon: 23.6978
            },
            rome: {
                lat: 12.4964,
                lon: 41.9028            
            },
            palga: {
                lat: 4.9036,
                lon: 52.3680            
            }
        };

        /*
        return(
            <div className="Dashboard">
                <NavHeader 
                    username={this.props.username} 
                    onLogout={this.props.onLogout}
                    render={this.state.animate_globe}
                    handleRenderChange={this.handleRenderChange}
                    />

                <Globe
                    nodes={nodes} 
                    animate={this.state.animate_globe}
                    />
            </div>
        );
    */

        return(
            <div className="Dashboard">
                <NavHeader 
                    username={this.props.username} 
                    onLogout={this.props.onLogout}
                    />

                <Row noGutters className="h-100 padded">
                    {/* LEFT COLUMN */}
                    <Col xs="3" >
                        <Row noGutters className="h-50">
                            <Col>
                                <Node
                                    app={this.app} 
                                    socket={this.state.admin_socket}
                                    />
                                </Col>
                        </Row>

                        <Row noGutters className="h-50">
                            <Col>
                                <Globe nodes={nodes} />
                            </Col>
                        </Row>
                    </Col>

                    {/* RIGHT COLUMN */}
                    <Col xs="9">
                        <Row noGutters className="h-50">
                            <Col>
                                <Terminal />
                            </Col>
                        </Row>

                        <Row noGutters className="h-50">
                            <Col>
                                <Log 
                                    socket={this.state.admin_socket}
                                    />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                
                <NavFooter />
            </div>        );
    };}

// Exports
export default Dashboard;
export {
    Dashboard
};