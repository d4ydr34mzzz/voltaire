import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/layout/Navbar.js";
import Login from "./components/auth/Login.js";
import Register from "./components/auth/Register.js";
import Profile from "./components/profile/Profile.js";
import InitializeProfile from "./components/profile/InitializeProfile.js";
import Explore from "./components/explore/Explore.js";
import PrivateRoute from "./components/shared/PrivateRoute.js";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />
          <Switch>
            <Route exact path="/">
              <div className="container-fluid pt-5 pb-5" id="showcase">
                <div className="container">
                  <Login />
                </div>
              </div>
            </Route>
            <Route path="/login">
              <div className="container-fluid pt-5 pb-5" id="showcase">
                <div className="container">
                  <Login />
                </div>
              </div>
            </Route>
            <Route path="/register">
              <div className="container-fluid pt-5 pb-5" id="showcase">
                <div className="container">
                  <Register />
                </div>
              </div>
            </Route>
            <PrivateRoute path="/dashboard" component={Profile} />
            <PrivateRoute
              path="/initialize-profile"
              component={InitializeProfile}
            />
            <PrivateRoute path="/explore" component={Explore} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
