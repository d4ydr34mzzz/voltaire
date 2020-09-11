import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css";
import Navbar from "./components/layout/Navbar.js";
import Welcome from "./components/index/Welcome.js";
import Login from "./components/auth/Login.js";
import Register from "./components/auth/Register.js";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container-fluid pt-5 pb-5">
          <div className="container">
            <Switch>
              <Route exact path="/">
                <Welcome />
              </Route>
              <Route path="/login">
                <Login />
              </Route>
              <Route path="/register">
                <Register />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
