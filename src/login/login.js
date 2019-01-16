import React, { Component } from 'react';
import {
    Label, Input
} from 'reactstrap';

import $ from "jquery";

import { config } from '../config';

import './login.css';

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
          username: props.username,
          password: '',
          server: 'localhost:3000',
          waiting_for_response: false
        };

        this.updateUsername = this.updateUsername.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.updateServer = this.updateServer.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    };

    updateUsername(event) {
        this.setState({username: event.target.value});
    }

    updatePassword(event) {
        this.setState({password: event.target.value}); 
    }

    updateServer(event) {
        this.setState({server: event.target.value});
    }

    handleSubmit(event) {
        //alert('The form was submitted: ' + this.state.value);
        // this.props.handleLogin(this.state.username, this.state.password);
        const username = this.state.username;
        const password = this.state.password;
        const ctx = this;

        var [host, ...port] = this.state.server.split(':')
        
        config.host = host;

        if (port.length) {
            config.port = port[0]
        } else {
            config.port = null;
        }

        this.setState({waiting_for_response: true});

        $.post({
            url: "/api/token/user",
            data: {
                username: username, 
                password: password
            },
        })
        .done((data) => {
            console.log("successfully authenticated!");

            $('#login-form').fadeOut(200, function() {
                console.log('notifying Application ...')
                ctx.props.onLogin(
                    username, 
                    data.access_token, 
                    data.refresh_token
                );
            });
        })
        .fail((data) => {
            console.log("failure:", data);
            
            $('#login-form').effect("shake", {
              direction: 'left', 
              distance: 5, 
              times: 3
            });

            this.setState({waiting_for_response: false})
        });

        event.preventDefault();
    };

    render() {
        console.log(this.state);
        var { waiting_for_response } = this.state;

        if (waiting_for_response) {
            var buttonOrSpinner = 
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>;
        } else {
            var buttonOrSpinner = <button type="submit" className="btn btn-primary">Submit</button>;
        }

        return (
            <div className="Login">
                <div className="login-content">
                    <div id="login-form">
     
                        <form onSubmit={this.handleSubmit}>
                            <div className="form-group">
                                <label>username</label>
                                <input 
                                    type="username" className="form-control" placeholder="username" 
                                    value={this.state.username} onChange={this.updateUsername}
                                    />
                            </div>
         
                            <div className="form-group">
                                <label>password</label>
                                <input 
                                    type="password" className="form-control" placeholder="password" 
                                    value={this.state.password} onChange={this.updatePassword}
                                    />
                            </div>
         
                            <div className="form-group">
                                <Label>ppDLI API-server: </Label>
                                <Input 
                                    type="select" name="select" id="exampleSelect"
                                    value={this.state.server} onChange={this.updateServer}
                                    >
                                    <option>localhost:5000</option>
                                    <option>192.168.1.2:5000</option>
                                </Input>                                
                            </div>

                            { buttonOrSpinner }
                        </form>
                    </div>
                </div>
             </div>    
        );
    }
}

// Exports
export default Login;
export {
    Login
};