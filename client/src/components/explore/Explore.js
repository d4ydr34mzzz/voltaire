import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchProfiles } from "../profile/profileSlice.js";
import LoadingIcon from "../shared/LoadingIcon.js";
import ProfileSummaryCard from "./ProfileSummaryCard.js";

class Explore extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchProfiles();
  }

  render() {
    const { profiles } = this.props.profile;

    let exploreContent;

    if (!profiles || this.props.profile.fetch_profiles_status !== "succeeded") {
      exploreContent = <LoadingIcon />;
    } else {
      exploreContent = profiles.map((profile) => (
        <ProfileSummaryCard key={profile._id} profile={profile} />
      ));
    }

    return (
      <div className="explore">
        <div className="container-fluid explore__header p-0"></div>
        <div className="container-fluid explore__body">
          <div className="container">{exploreContent}</div>
        </div>
      </div>
    );
  }
}

// Select data from store that the Explore component needs; each field with become a prop in the Explore component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the Explore component
 */
const mapDispatchToProps = {
  fetchProfiles,
};

// Connect the Explore component to the Redux store
export default connect(mapStateToProps, mapDispatchToProps)(Explore);
