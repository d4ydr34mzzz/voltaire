import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchCurrentUsersProfile } from "./profileSlice.js";
import { withRouter } from "react-router-dom";

class Profile extends Component {
  componentDidMount() {
    this.props.fetchCurrentUsersProfile();
  }

  render() {
    return <div></div>;
  }
}

// Select data from store that the Profile component needs; each field with become a prop in the Profile component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the Profile component
 */
const mapDispatchToProps = {
  fetchCurrentUsersProfile,
};

// Connect the Profile component to the Redux store
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Profile));
