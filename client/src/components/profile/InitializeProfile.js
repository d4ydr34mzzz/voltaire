import React, { Component } from "react";
import { connect } from "react-redux";
import InputFormGroup from "../forms/InputFormGroup.js";
import SelectFormGroup from "../forms/SelectFormGroup.js";
import { fetchCurrentUser } from "../auth/authSlice.js";
import { initializeUserProfile, clearErrors } from "./profileSlice.js";
import { withRouter } from "react-router-dom";

class InitializeProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displaySocialInputs: false,
      firstName: this.props.auth.user.firstName,
      lastName: this.props.auth.user.lastName,
      handle: "",
      header: "",
      status: "",
      errors: {},
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.cancelProfileInitialization = this.cancelProfileInitialization.bind(
      this
    );
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.fetchCurrentUser().then(() => {
      this.setState({
        firstName: this.props.auth.user.firstName,
        lastName: this.props.auth.user.lastName,
      });
    });
  }

  componentWillUnmount() {
    this.props.fetchCurrentUser().then(() => {
      this.props.clearErrors();
    });
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
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      handle: this.state.handle,
      header: this.state.header,
      status: this.state.status,
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
      <div className="create-profile">
        <div className="container-fluid page-header"></div>
        <div className="container-fluid pt-5 pb-5">
          <div className="container">
            <div className="row">
              <div className="col-sm-10 offset-sm-1">
                <div className="card">
                  <div className="card-body">
                    <h1 className="card-title card-title--font-size mb-5">
                      Initialize your profile
                    </h1>

                    <form onSubmit={this.handleSubmit} noValidate>
                      <InputFormGroup
                        htmlFor="firstName"
                        label="First name"
                        name="firstName"
                        type="text"
                        error={errors.firstName}
                        id="firstName"
                        value={this.state.firstName}
                        onChange={this.handleInputChange}
                        required={true}
                      />

                      <InputFormGroup
                        htmlFor="lastName"
                        label="Last name"
                        name="lastName"
                        type="text"
                        error={errors.lastName}
                        id="lastName"
                        value={this.state.lastName}
                        onChange={this.handleInputChange}
                        required={true}
                      />

                      <InputFormGroup
                        htmlFor="handle"
                        label="Handle"
                        name="handle"
                        type="text"
                        error={errors.handle}
                        id="handle"
                        value={this.state.handle}
                        onChange={this.handleInputChange}
                        required={true}
                      />

                      <InputFormGroup
                        htmlFor="header"
                        label="Header"
                        name="header"
                        type="text"
                        error={errors.header}
                        id="header"
                        value={this.state.header}
                        onChange={this.handleInputChange}
                        required={true}
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
                        required={true}
                      />

                      <div className="float-right mt-4">
                        <button
                          type="button"
                          class="btn btn-secondary mr-4"
                          onClick={this.cancelProfileInitialization}
                        >
                          Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
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
  auth: state.auth,
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the Register component
 */
const mapDispatchToProps = {
  fetchCurrentUser,
  initializeUserProfile,
  clearErrors,
};

// Connect the InitializeProfile component to the Redux store
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(InitializeProfile));
