import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchCurrentUsersProfile } from "./profileSlice.js";
import { withRouter } from "react-router-dom";
import LoadingIcon from "../shared/LoadingIcon.js";

class Profile extends Component {
  componentDidMount() {
    this.props.fetchCurrentUsersProfile();
  }

  render() {
    const { user } = this.props.auth;
    const { profile } = this.props.profile;

    let profileContent;

    if (
      profile === null ||
      profile.fetch_current_users_profile_status === "loading"
    ) {
      profileContent = <LoadingIcon />;
    } else {
      if (Object.keys(profile).length > 0) {
        profileContent = <h1>User's profile</h1>;
      } else {
        profileContent = (
          <div className="mt-5 text-center">
            <h2 className="font-weight-normal profile__setup-profile-msg">
              You haven't setup your profile yet
            </h2>
            <a href="#" className="btn btn-primary profile__setup-profile-btn">
              Setup profile
            </a>
          </div>
        );
      }
    }

    return (
      <div className="profile">
        <div className="container-fluid profile__header"></div>
        <div className="container-fluid">
          <div className="container">
            <img
              src={user.picture}
              alt=""
              className="rounded-circle profile__avatar"
            ></img>
            <h1 className="profile__username ml-3">{user.fullName}</h1>
          </div>
          <div className="container pt-5">{profileContent}</div>
        </div>
      </div>
    );
  }
}

// Select data from store that the Profile component needs; each field with become a prop in the Profile component
const mapStateToProps = (state) => ({
  auth: state.auth,
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
