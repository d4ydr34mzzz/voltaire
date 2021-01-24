import React, { Component } from "react";
import { connect } from "react-redux";
import {
  addGitHubUsername,
  clearAddGitHubUsernameErrors,
} from "./profileSlice.js";
import InputInputGroup from "../forms/InputInputGroup.js";

class AddGitHubUsernameModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      githubUsername: this.props.profile
        ? this.props.profile.profile.githubUsername
        : "",
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClearGitHubUsernameButtonClick = this.handleClearGitHubUsernameButtonClick.bind(
      this
    );
    this.cancelAddGitHubUsername = this.cancelAddGitHubUsername.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearAddGitHubUsernameErrors();
  }

  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value,
    });
  }

  handleClearGitHubUsernameButtonClick(event) {
    this.setState({
      githubUsername: "",
    });
  }

  cancelAddGitHubUsername(event) {
    event.preventDefault();
    this.props.onModalAlteration("");
  }

  handleSubmit(event) {
    event.preventDefault();

    const githubData = {
      githubUsername: this.state.githubUsername,
    };

    console.log(githubData);

    this.props.addGitHubUsername(githubData).then(() => {
      if (this.props.profile.add_github_username_status === "succeeded") {
        this.props.onModalAlteration("");
      }
    });
  }

  render() {
    let errors = this.props.profile.add_github_username_errors
      ? this.props.profile.add_github_username_errors
      : {};

    return (
      <div className="modal-overlay" onClick={this.cancelAddGitHubUsername}>
        <div
          className="modal__content card"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="card-header">
            GitHub
            <a
              href="#"
              className="modal__exit-icon"
              onClick={this.cancelAddGitHubUsername}
            >
              <i className="fas fa-times"></i>
            </a>
          </div>
          <div className="card-body">
            {errors.error ? (
              <div class="alert alert-danger" role="alert">
                {errors.error.msg}
              </div>
            ) : null}
            <p className="mb-4">
              If you would like a link to your GitHub page and your latest
              public repositories displayed on your profile, please provide your
              GitHub username below:
            </p>
            <form onSubmit={this.handleSubmit} noValidate>
              <InputInputGroup
                htmlFor="githubUsername"
                icon="fab fa-github"
                name="githubUsername"
                type="url"
                error={errors.githubUsername}
                id="githubUsername"
                value={this.state.githubUsername}
                placeholder="GitHub username"
                onChange={this.handleInputChange}
                button={<i class="fas fa-eraser"></i>}
                onButtonClick={this.handleClearGitHubUsernameButtonClick}
              />

              <div className="float-right mt-4 mb-4">
                <button
                  type="button"
                  className="btn btn-secondary mr-4"
                  onClick={this.cancelAddGitHubUsername}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

// Select data from store that the AddGitHubUsernameModal component needs; each field with become a prop in the AddGitHubUsernameModal component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the AddGitHubUsernameModal component
 */
const mapDispatchToProps = {
  addGitHubUsername,
  clearAddGitHubUsernameErrors,
};

// Connect the AddGitHubUsernameModal component to the Redux store
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddGitHubUsernameModal);
