import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

// Wrapper for <Route> to check if the user is authenticated; unauthenticated users are redirected to the login screen.
function PrivateRoute({ component: Component, auth, ...rest }) {
  return (
    <Route
      {...rest}
      render={(routeProps) =>
        auth.isAuthenticated === true ? (
          <Component {...routeProps} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
}

// Select data from store that the PrivateRoute component needs; each field with become a prop in the PrivateRoute component
const mapStateToProps = (state) => ({
  auth: state.auth,
});

// Connect the PrivateRoute component to the Redux store
export default connect(mapStateToProps)(PrivateRoute);
