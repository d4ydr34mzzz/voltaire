import React, { Component } from "react";
import { connect } from "react-redux";
import InputFormGroup from "../forms/InputFormGroup.js";
import InputInputGroup from "../forms/InputInputGroup.js";
import SelectFormGroup from "../forms/SelectFormGroup.js";
import TextareaFormGroup from "../forms/TextareaFormGroup.js";
import { initializeUserProfile, clearErrors } from "./profileSlice.js";
import { withRouter } from "react-router-dom";

class InitializeProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displaySocialInputs: false,
      handle: "",
      company: "",
      website: "",
      location: "",
      status: "",
      skills: "",
      bio: "",
      githubUsername: "",
      youtube: "",
      twitter: "",
      facebook: "",
      linkedin: "",
      instagram: "",
      errors: {},
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.cancelProfileInitialization = this.cancelProfileInitialization.bind(
      this
    );
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearErrors();
  }

  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value,
    });
  }

  cancelProfileInitialization(event) {
    this.props.history.push("/dashboard");
  }

  handleSubmit(event) {
    event.preventDefault();

    const profileData = {
      handle: this.state.handle,
      company: this.state.company,
      website: this.state.website,
      location: this.state.location,
      status: this.state.status,
      skills: this.state.skills,
      bio: this.state.bio,
      githubUsername: this.state.githubUsername,
      youtube: this.state.youtube,
      twitter: this.state.twitter,
      facebook: this.state.facebook,
      linkedin: this.state.linkedin,
      instagram: this.state.instagram,
    };

    this.props.initializeUserProfile(profileData).then(() => {
      if (this.props.profile.initialize_user_profile_status === "succeeded") {
        this.props.history.push("/dashboard");
      }
    });
  }

  render() {
    const errors = this.props.profile ? this.props.profile.errors : {};
    const options = [
      { label: "Select professional status", value: 0 },
      { label: "Developer", value: "Developer" },
      { label: "Junior developer", value: "Junior developer" },
      { label: "Senior developer", value: "Senior developer" },
      { label: "Manager", value: "Manager" },
      { label: "Student", value: "Student" },
      { label: "Instructor", value: "Instructor" },
      { label: "Intern", value: "Intern" },
      { label: "Other", value: "Other" },
    ];
    return (
      <div className="container-fluid pt-5 pb-5 create-profile">
        <div className="container">
          <div className="row">
            <div className="col-sm-10 offset-sm-1">
              <div className="card">
                <div className="card-body">
                  <h1 className="card-title card-title--font-size mb-5">
                    Initialize your profile
                  </h1>

                  <form onSubmit={this.handleSubmit}>
                    <InputFormGroup
                      htmlFor="handle"
                      label="Handle"
                      name="handle"
                      type="text"
                      error={errors.handle}
                      id="handle"
                      value={this.state.handle}
                      onChange={this.handleInputChange}
                    />

                    <SelectFormGroup
                      htmlFor="status"
                      label="Professional status"
                      name="status"
                      error={errors.status}
                      id="status"
                      value={this.state.status}
                      options={options}
                      onChange={this.handleInputChange}
                    />

                    <InputFormGroup
                      htmlFor="company"
                      label="Company"
                      name="company"
                      type="text"
                      error={errors.company}
                      value={this.state.company}
                      onChange={this.handleInputChange}
                    />

                    <InputFormGroup
                      htmlFor="website"
                      label="Website"
                      name="website"
                      type="url"
                      error={errors.website}
                      value={this.state.website}
                      onChange={this.handleInputChange}
                    />

                    <InputFormGroup
                      htmlFor="location"
                      label="Location"
                      name="location"
                      type="text"
                      error={errors.location}
                      value={this.state.location}
                      onChange={this.handleInputChange}
                    />

                    <InputFormGroup
                      htmlFor="skills"
                      label="Skills"
                      name="skills"
                      type="text"
                      error={errors.skills}
                      value={this.state.skills}
                      onChange={this.handleInputChange}
                      info="Please use comma-separated values (e.g. HTML,CSS,JavaScript)"
                    />

                    <InputFormGroup
                      htmlFor="github"
                      label="GitHub username"
                      name="github"
                      type="text"
                      error={errors.github}
                      value={this.state.github}
                      onChange={this.handleInputChange}
                      info="If you would like a link to your GitHub page and your latest repositories displayed on your profile, please include your GitHub username"
                    />

                    <TextareaFormGroup
                      htmlFor="bio"
                      label="About me"
                      name="bio"
                      rows="10"
                      error={errors.bio}
                      value={this.state.bio}
                      onChange={this.handleInputChange}
                    />

                    <InputInputGroup
                      htmlFor="youtube"
                      icon="fab fa-youtube"
                      name="youtube"
                      type="url"
                      error={errors.youtube}
                      id="youtube"
                      value={this.state.youtube}
                      placeholder="YouTube"
                      onChange={this.handleInputChange}
                    />

                    <InputInputGroup
                      htmlFor="twitter"
                      icon="fab fa-twitter"
                      name="twitter"
                      type="url"
                      error={errors.twitter}
                      id="twitter"
                      value={this.state.twitter}
                      placeholder="Twitter"
                      onChange={this.handleInputChange}
                    />

                    <InputInputGroup
                      htmlFor="facebook"
                      icon="fab fa-facebook"
                      name="facebook"
                      type="url"
                      error={errors.facebook}
                      id="facebook"
                      value={this.state.facebook}
                      placeholder="Facebook"
                      onChange={this.handleInputChange}
                    />

                    <InputInputGroup
                      htmlFor="linkedin"
                      icon="fab fa-linkedin"
                      name="linkedin"
                      type="url"
                      error={errors.linkedin}
                      id="linkedin"
                      value={this.state.linkedin}
                      placeholder="LinkedIn"
                      onChange={this.handleInputChange}
                    />

                    <InputInputGroup
                      htmlFor="instagram"
                      icon="fab fa-instagram-square"
                      name="instagram"
                      type="url"
                      error={errors.instagram}
                      id="instagram"
                      value={this.state.instagram}
                      placeholder="Instagram"
                      onChange={this.handleInputChange}
                    />

                    <div className="float-right mt-4">
                      <button
                        type="button"
                        class="btn btn-secondary mr-3"
                        onClick={this.cancelProfileInitialization}
                      >
                        Cancel
                      </button>
                      <button type="submit" class="btn btn-primary">
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Select data from store that the InitializeProfile component needs; each field with become a prop in the InitializeProfile component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the Register component
 */
const mapDispatchToProps = {
  initializeUserProfile,
  clearErrors,
};

// Connect the InitializeProfile component to the Redux store
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(InitializeProfile));
