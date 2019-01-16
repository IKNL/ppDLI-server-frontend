import React, { Component } from 'react';

import { Login } from '../login/login';
import { Dashboard } from '../dashboard/dashboard';

import './app.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.storage = window.localStorage;

        this.state = {
            access_token: this.storage.getItem('access_token'),
            refresh_token: '',
            username: this.storage.getItem('username') || ''
        };     

        this.onLogin = this.onLogin.bind(this);
        this.onLogout = this.onLogout.bind(this);
    };

    onLogin(username, access_token, refresh_token) {
        console.log('onLogin: ', username);
        console.log('setting state ... ');

        // setState triggers rerendering of components, so
        // this has to happen *before* setState
        this.storage.setItem('username', username);
        this.storage.setItem('access_token', access_token);

        this.setState({
            username: username,
            access_token: access_token,
            refresh_token: refresh_token
        });
    };

    onLogout() {
        console.log('onLogout: ', this.state.username);

        this.storage.setItem('access_token', '');        
        this.storage.setItem('refresh_token', '');        

        this.setState({
            access_token: '',
            refresh_token: ''
        });
    }

    render() {
        if (this.state.access_token) {
            return(
                <div className="App">
                    <Dashboard 
                        app={this}
                        username={this.state.username}
                        onLogout={this.onLogout}
                        />
                </div>
            )
        }

        // console.log('No access token, displaying login screen!');
        return(
            <div className="App">
                <Login 
                    username={this.state.username}
                    onLogin={this.onLogin}
                    />
            </div>
        )
    };
}

// Exports
export default App;
export {
    App
};