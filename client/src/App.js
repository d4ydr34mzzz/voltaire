import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/layout/Navbar.js";
import Login from "./components/auth/Login.js";
import Register from "./components/auth/Register.js";
import Profile from "./components/profile/Profile.js";
import SecondaryProfile from "./components/profile/SecondaryProfile.js";
import InitializeProfile from "./components/profile/InitializeProfile.js";
import Explore from "./components/explore/Explore.js";
import PrivateRoute from "./components/shared/PrivateRoute.js";
import axios from "axios";
import {
  setItemInLocalStorageWithExpiry,
  getItemFromLocalStorageWithExpiryCheck,
} from "../src/helpers/localStorage.js";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showcaseImage: "",
    };
  }

  componentDidMount() {
    if (
      !localStorage.getItem("showcaseImage") ||
      !getItemFromLocalStorageWithExpiryCheck("showcaseImage")
    ) {
      axios.get("/api/showcase").then((response) => {
        this.setState({ showcaseImage: response.data.showcaseImage });
        setItemInLocalStorageWithExpiry(
          "showcaseImage",
          response.data.showcaseImage,
          24 * 60 * 60 * 1000
        );
      });
    } else {
      let showcaseImage = getItemFromLocalStorageWithExpiryCheck(
        "showcaseImage"
      );
      this.setState({ showcaseImage: showcaseImage });
    }
  }

  render() {
    const showcaseImageStyle = {
      backgroundImage: `url(${this.state.showcaseImage})`,
    };

    return (
      <Router>
        <div className="App">
          <Navbar />
          <Switch>
            <Route exact path="/">
              <div
                className="container-fluid pt-5 pb-5"
                id="showcase"
                style={showcaseImageStyle}
              >
                <div className="container">
                  <Login />
                </div>
              </div>
            </Route>
            <Route path="/login">
              <div
                className="container-fluid pt-5 pb-5"
                id="showcase"
                style={showcaseImageStyle}
              >
                <div className="container">
                  <Login />
                </div>
              </div>
            </Route>
            <Route path="/register">
              <div
                className="container-fluid pt-5 pb-5"
                id="showcase"
                style={showcaseImageStyle}
              >
                <div className="container">
                  <Register />
                </div>
              </div>
            </Route>
            <PrivateRoute path="/dashboard" component={Profile} />
            <PrivateRoute
              path="/profile/:handle"
              component={SecondaryProfile}
            />
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
