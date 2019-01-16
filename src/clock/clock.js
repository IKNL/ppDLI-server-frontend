import React, { Component } from 'react';
import strftime from 'strftime';

import './clock.css';

class Clock extends Component {

    constructor(props) {
        super(props);

        this.state = {
            date: new Date()
        };
    }

    componentDidMount() {
        this.timerID = setInterval(
          () => this.tick(),
          1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.setState({
            date: new Date()
        });
    }

    render() {
        return(
            <div className="Clock">
                {strftime('%H:%M:%S', this.state.date)}
            </div>
        );
    }
}

// Exports
export default Clock;
export {
    Clock
};