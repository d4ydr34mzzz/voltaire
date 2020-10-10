import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { fetchCurrentUsersProfile } from "./profileSlice.js";
import { withRouter } from "react-router-dom";
import LoadingIcon from "../shared/LoadingIcon.js";
import AddExperienceModal from "./AddExperienceModal.js";
import AddEducationModal from "./AddEducationModal.js";
import AddSectionModal from "./AddSectionModal.js";
import AddAboutModal from "./AddAboutModal.js";
import AddSkillModal from "./AddSkillModal.js";
import AddSocialLinksModal from "./AddSocialLinksModal.js";
import AddGitHubUsernameModal from "./AddGitHubUsernameModal.js";
import AboutSection from "./AboutSection.js";
import ExperienceSection from "./ExperienceSection.js";
import EducationSection from "./EducationSection.js";
import SkillSection from "./SkillSection.js";
import SocialLinksSection from "./SocialLinksSection.js";

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: "",
      entryId: "",
    };

    this.handleAddExperienceClick = this.handleAddExperienceClick.bind(this);
    this.handleAddEducationClick = this.handleAddEducationClick.bind(this);
    this.handleAddAboutClick = this.handleAddAboutClick.bind(this);
    this.handleAddSkillClick = this.handleAddSkillClick.bind(this);
    this.handleAddSectionClick = this.handleAddSectionClick.bind(this);
    this.handleModalAlteration = this.handleModalAlteration.bind(this);
  }

  componentDidMount() {
    this.props.fetchCurrentUsersProfile();
  }

  handleAddExperienceClick(event) {
    event.preventDefault();
    this.setState({
      modal: "experience",
    });
  }

  handleAddEducationClick(event) {
    event.preventDefault();
    this.setState({
      modal: "education",
    });
  }

  handleAddAboutClick(event) {
    event.preventDefault();
    this.setState({
      modal: "about",
    });
  }

  handleAddSkillClick(event) {
    event.preventDefault();
    this.setState({
      modal: "skills",
    });
  }

  handleAddSectionClick(event) {
    event.preventDefault();
    this.setState({
      modal: "addSection",
    });
  }

  handleModalAlteration(modal, entryId = "") {
    this.setState({
      modal: modal,
      entryId: entryId,
    });
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
        profileContent = (
          <div>
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

            {profile.skills && profile.skills.length > 0 ? (
              <SkillSection
                skills={profile.skills}
                onModalAlteration={this.handleModalAlteration}
              />
            ) : null}
          </div>
        );
      } else {
        profileContent = (
          <div className="mt-5 text-center">
            <h2 className="font-weight-normal profile__initialize-profile-msg">
              You haven't initialized your profile yet
            </h2>
            <Link
              to="/initialize-profile"
              className="btn btn-primary profile__initialize-profile-btn"
            >
              Initialize profile
            </Link>
          </div>
        );
      }
    }

    return (
      <div>
        {this.state.modal === "education" ? (
          <AddEducationModal onModalAlteration={this.handleModalAlteration} />
        ) : null}
        {this.state.modal === "editEducation" ? (
          <AddEducationModal
            onModalAlteration={this.handleModalAlteration}
            entryId={this.state.entryId}
          />
        ) : null}
        {this.state.modal === "experience" ? (
          <AddExperienceModal onModalAlteration={this.handleModalAlteration} />
        ) : null}
        {this.state.modal === "editExperience" ? (
          <AddExperienceModal
            onModalAlteration={this.handleModalAlteration}
            entryId={this.state.entryId}
          />
        ) : null}
        {this.state.modal === "about" ? (
          <AddAboutModal onModalAlteration={this.handleModalAlteration} />
        ) : null}
        {this.state.modal === "skills" ? (
          <AddSkillModal onModalAlteration={this.handleModalAlteration} />
        ) : null}
        {this.state.modal === "links" ? (
          <AddSocialLinksModal onModalAlteration={this.handleModalAlteration} />
        ) : null}
        {this.state.modal === "github" ? (
          <AddGitHubUsernameModal
            onModalAlteration={this.handleModalAlteration}
          />
        ) : null}
        {this.state.modal === "addSection" ? (
          <AddSectionModal onModalAlteration={this.handleModalAlteration} />
        ) : null}
        <div className="profile">
          <div className="container-fluid profile__header"></div>
          <div className="container-fluid profile__body">
            <div className="container">
              <div className="col-sm-10 offset-sm-1">
                <div className="profile__add-section-btn">
                  <a
                    href="#"
                    className="btn btn-primary"
                    onClick={this.handleAddSectionClick}
                  >
                    Add section
                  </a>
                </div>
                <div className="profile__section profile__section--top">
                  <a href="#" className="profile__edit-icon">
                    <i className="fas fa-pen"></i>
                  </a>
                  <img
                    src={user.picture}
                    alt=""
                    className="rounded-circle profile__avatar"
                  ></img>
                  <h1 className="profile__username ml-3">{user.fullName}</h1>
                </div>
                <div>{profileContent}</div>
              </div>
            </div>
          </div>
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