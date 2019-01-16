import React, { Component } from 'react';

import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';

import './log.css';

Terminal.applyAddon(fit);

class Log extends Component {

    constructor(props) {
        super(props);
        this.term = null;

        this.debounce = this.debounce.bind(this);
        this.fitToscreen = this.fitToscreen.bind(this);
    }

    componentDidMount() {
        var socket = this.props.socket;

        if (socket) {
            this.connectSocketEvents(socket);
        } else {
            console.log('Log.componentDidMount() - no socket :-(');
        }
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
        this.term.fit();
        this.props.socket.emit("resize", {
            "cols": this.term.cols, 
            "rows": this.term.rows
        });
    }

    connectSocketEvents(socket) {
        // define event handlers
        socket.on("append-log", (data) => {
            if (this.term) {
                this.term.writeln(data);
            } else {
                console.warn('this.term is not set!');
            }
        });

        socket.on('disconnect', () => {
          console.log("disconnected /admin!!!!");
          if (this.term) {
              this.term.destroy();
          } else {
              console.warn('this.term is not set!');
          }

          socket.close();
          socket.open();
        });

        socket.on('connect', () => {
            this.term = new Terminal({
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


            // open the terminal
            this.term.open(document.getElementById('log'));
            const wait_ms = 50;
            window.addEventListener('resize', this.debounce(this.fitToscreen, wait_ms));

            this.term.fit();
        });
    }    

    render() {
        if (this.term) {
            this.term.fit();        
        }

        return(
            <div className="Log">
                <div className="header">Log</div>

                <div className="panel">
                    <div id="log"></div>
                </div>
            </div>
        );
    };
}

// Exports
export default Log;
export {
    Log
};