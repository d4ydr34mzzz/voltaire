import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchProfileByHandle } from "./profileSlice.js";
import { withRouter } from "react-router-dom";
import LoadingIcon from "../shared/LoadingIcon.js";
import GeneralInformationSection from "./GeneralInformationSection.js";
import AboutSection from "./AboutSection.js";
import ExperienceSection from "./ExperienceSection.js";
import EducationSection from "./EducationSection.js";
import SkillSection from "./SkillSection.js";
import InterestsSection from "./InterestsSection.js";
import SocialLinksSection from "./SocialLinksSection.js";
import GitHubSection from "./GitHubSection.js";

class SecondaryProfile extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchProfileByHandle(this.props.match.params.handle);
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.handle !== prevProps.match.params.handle) {
      this.props.fetchProfileByHandle(this.props.match.params.handle);
    }
  }

  render() {
    let profile = this.props.profile && this.props.profile.secondaryProfile;

    let profileContent;
    let exceptions;

    if (
      !profile ||
      (this.props.profile &&
        this.props.profile.fetch_profile_by_handle_status === "loading")
    ) {
      profileContent = <LoadingIcon />;
    } else if (
      this.props.profile &&
      this.props.profile.fetch_profile_by_handle_status === "failed"
    ) {
      exceptions = (
        <div class="alert alert-secondary" role="alert">
          There was an issue processing the request. Please try again later.
        </div>
      );
    } else {
      if (Object.keys(profile).length > 0) {
        profileContent = (
          <div>
            {profile ? (
              <GeneralInformationSection
                onModalAlteration={this.handleModalAlteration}
                user={profile.user}
                profilePictureCropped={profile.profilePictureCropped}
                coverImageCropped={profile.coverImageCropped}
                header={profile.header}
                location={profile.location}
                status={profile.status}
              />
            ) : null}
            {profile.social ? (
              <SocialLinksSection
                links={profile.social}
                onModalAlteration={this.handleModalAlteration}
              />
            ) : null}
            {profile.bio ? (
              <AboutSection
                bio={profile.bio}
                onModalAlteration={this.handleModalAlteration}
              />
            ) : null}

            {profile.experience && profile.experience.length > 0 ? (
              <ExperienceSection
                experience={profile.experience}
                onModalAlteration={this.handleModalAlteration}
              />
            ) : null}

            {profile.education && profile.education.length > 0 ? (
              <EducationSection
                education={profile.education}
                onModalAlteration={this.handleModalAlteration}
              />
            ) : null}
            {profile.githubUsername ? (
              <GitHubSection
                username={profile.githubUsername}
                onModalAlteration={this.handleModalAlteration}
              />
            ) : null}
            {profile.skills && profile.skills.length > 0 ? (
              <SkillSection
                skills={profile.skills}
                onModalAlteration={this.handleModalAlteration}
              />
            ) : null}

            {profile.interests && profile.interests.length > 0 ? (
              <InterestsSection
                interests={profile.interests}
                onModalAlteration={this.handleModalAlteration}
              />
            ) : null}
          </div>
        );
      } else {
        exceptions = (
          <div class="alert alert-secondary" role="alert">
            There was an issue processing the request. Please try again later.
          </div>
        );
      }
    }

    return (
      <div className="profile">
        <div className="container-fluid profile__header p-0">
          <div className="container pt-5">{exceptions}</div>
        </div>
        <div className="container-fluid profile__body">
          <div className="container">
            <div className="col-sm-10 offset-sm-1">
              <div>{profileContent}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Select data from store that the SecondaryProfile component needs; each field with become a prop in the SecondaryProfile component
const mapStateToProps = (state) => ({
  auth: state.auth,
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the SecondaryProfile component
 */
const mapDispatchToProps = {
  fetchProfileByHandle,
};

// Connect the SecondaryProfile component to the Redux store
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(SecondaryProfile));
