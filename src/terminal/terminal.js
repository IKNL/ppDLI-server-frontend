import React, { Component } from 'react';

import io from 'socket.io-client';

import { Terminal as XTerm } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';

import * as util from '../util';

import './terminal.css';

XTerm.applyAddon(fit);

class Terminal extends Component {

    constructor(props) {
        super(props);
        this.term = null;

        this.debounce = this.debounce.bind(this);
        this.fitToscreen = this.fitToscreen.bind(this);
    }

    componentDidMount() {
        var token = localStorage.getItem('access_token');
        var socket_options = {
            transportOptions: {
                polling: {
                    extraHeaders: {
                      Authorization: "Bearer " + token
                    }
                }
            }
        };

        var host = util.getBaseURL(false) + '/pty';
        this.socket = io.connect(host, socket_options);
        var socket = this.socket;

        socket.on('connect', () => {
            this.term = new XTerm({
                screenKeys: true,
                cursorBlink: true,
                cursorStyle: "underline",
                fontSize: 11,
                fontFamily: 'fira_mono',
                allowTransparency: true,
                theme: {
                    // background: '#0e1326'
                    background: 'rgba(0, 0, 0, 0.0)',
                }
            });
            var term = this.term;

            // define event handlers
            term.on('key', (key, ev) => {
                socket.emit("pty-input", {"input": key})
            });

            term.on('title', (title) => {
                console.log('title:', title)
                document.title = title;
            });

            socket.on("pty-output", function(data) {
                term.write(data.output)
            })

            socket.on('disconnect', () => {
                console.log("disconnected pty!!!!")
                term.destroy();
                socket.close();
                socket.open();
            });

            // open the terminal
            term.open(document.getElementById('terminal'));
            const wait_ms = 50;

            window.addEventListener('resize', this.debounce(this.fitToscreen, wait_ms));

            term.fit();
        });
    }

    debounce(func, wait_ms) {
      let timeout

      return function(...args) {
        const context = this
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(context, args), wait_ms)
      }
    }

    fitToscreen() {
        console.log('Terminal::fitToscreen')
        this.term.fit();
        this.socket.emit("resize", {
            "cols": this.term.cols, 
            "rows": this.term.rows
        });
    }

    render() {
        return (
            <div className="Terminal">
                <div className="header">Terminal</div>

                <div className="panel">
                    <div id="terminal"></div>
                </div>
            </div>
        );
    }
}

// Exports
export default Terminal;
export {
    Terminal
};