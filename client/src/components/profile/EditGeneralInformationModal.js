import React, { Component } from "react";
import { connect } from "react-redux";
import {
  editGeneralInformation,
  clearEditGeneralInformationErrors,
} from "./profileSlice.js";
import SelectFormGroup from "../forms/SelectFormGroup.js";
import InputFormGroup from "../forms/InputFormGroup.js";

class EditGeneralInformationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: this.props.profile.profile.user.firstName,
      lastName: this.props.profile.profile.user.lastName,
      handle: this.props.profile.profile.handle,
      header: this.props.profile.profile.header,
      location: this.props.profile.profile.location,
      status: this.props.profile.profile.status,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.cancelEditGeneralInformation = this.cancelEditGeneralInformation.bind(
      this
    );
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearEditGeneralInformationErrors();
  }

  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value,
    });
  }

  cancelEditGeneralInformation(event) {
    event.preventDefault();
    this.props.onModalAlteration("");
  }

  handleSubmit(event) {
    event.preventDefault();

    const generalInformationData = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      handle: this.state.handle,
      header: this.state.header,
      location: this.state.location,
      status: this.state.status,
    };

    this.props.editGeneralInformation(generalInformationData).then(() => {
      if (this.props.profile.edit_general_information_status === "succeeded") {
        this.props.onModalAlteration("");
      }
    });
  }

  render() {
    let errors = this.props.profile.edit_general_information_errors
      ? this.props.profile.edit_general_information_errors
      : {};

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
      <div
        className="modal-overlay"
        onClick={this.cancelEditGeneralInformation}
      >
        <div
          className="modal__content card"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="card-header">
            General information
            <a
              href="#"
              className="modal__exit-icon"
              onClick={this.cancelEditGeneralInformation}
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

              <InputFormGroup
                htmlFor="location"
                label="Location"
                name="location"
                type="text"
                error={errors.location}
                id="location"
                value={this.state.location}
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
                required={true}
              />

              <div className="float-right mt-4 mb-4">
                <button
                  type="button"
                  className="btn btn-secondary mr-4"
                  onClick={this.cancelEditGeneralInformation}
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

// Select data from store that the EditGeneralInformationModal component needs; each field with become a prop in the EditGeneralInformationModal component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the EditGeneralInformationModal component
 */
const mapDispatchToProps = {
  editGeneralInformation,
  clearEditGeneralInformationErrors,
};

// Connect the EditGeneralInformationModal component to the Redux store
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditGeneralInformationModal);
