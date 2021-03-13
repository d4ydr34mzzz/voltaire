import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { logoutUser } from "../auth/authSlice.js";
import { withRouter } from "react-router-dom";
import shortid from "shortid";

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.handleLogoutClick = this.handleLogoutClick.bind(this);
  }

  handleLogoutClick(event) {
    event.preventDefault();
    this.props.logoutUser().then(() => {
      if (this.props.auth.logout_status === "succeeded") {
        this.props.history.push("/login");
      }
    });
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    const guestLinks = (
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link className="nav-link" to="/register">
            Sign up
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/login">
            Log in
          </Link>
        </li>
      </ul>
    );

    const authLinksLeft = (
      <ul className="navbar-nav mr-auto" key={shortid.generate()}>
        <li className="nav-item">
          <Link className="nav-link" to="/explore">
            Explore
          </Link>
        </li>
      </ul>
    );

    const authLinksRight = (
      <ul className="navbar-nav ml-auto" key={shortid.generate()}>
        <li className="nav-item">
          <a className="nav-link" href="#" onClick={this.handleLogoutClick}>
            Log out
          </a>
        </li>
      </ul>
    );

    /* Reference: https://stackoverflow.com/a/36913042 */
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark navbar--background-color">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Voltaire
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            {isAuthenticated ? [authLinksLeft, authLinksRight] : guestLinks}
          </div>
        </div>
      </nav>
    );
  }
}

// Select data from store that the Navbar component needs; each field with become a prop in the Navbar component
const mapStateToProps = (state) => ({
  auth: state.auth,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the Navbar component
 */
const mapDispatchToProps = {
  logoutUser,
};

// Connect the Navbar component to the Redux store
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Navbar));
