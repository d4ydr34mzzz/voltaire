import React, { Component } from "react";
import { connect } from "react-redux";
import {
  addEducation,
  clearAddEducationErrors,
  editEducation,
  clearEditEducationErrors,
  deleteEducation,
  clearDeleteEducationErrors,
} from "./profileSlice.js";
import InputFormGroup from "../forms/InputFormGroup.js";
import TextareaFormGroup from "../forms/TextareaFormGroup.js";
import classNames from "classnames";

class AddEducationModal extends Component {
  constructor(props) {
    super(props);

    if (this.props.entryId) {
      let educations = [];
      let education = {};

      if (
        this.props.profile &&
        this.props.profile.profile &&
        this.props.profile.profile.education
      ) {
        educations = this.props.profile.profile.education;
      }

      education = educations.find(
        (education) => education._id === this.props.entryId
      );

      if (education) {
        this.state = {
          editing: true,
          school: education.school ? education.school : "",
          degree: education.degree ? education.degree : "",
          fieldOfStudy: education.fieldOfStudy ? education.fieldOfStudy : "",
          from: education.from ? education.from.split("T")[0] : "",
          to: education.to ? education.to.split("T")[0] : "",
          toDisabled: education.to ? false : true,
          current: education.current ? education.current : "",
          description: education.description ? education.description : "",
          activities: education.activities ? education.activities : "",
        };
      } else {
        this.state = {
          school: "",
          degree: "",
          fieldOfStudy: "",
          from: "",
          to: "",
          toDisabled: false,
          current: false,
          description: "",
          activities: "",
        };
      }
    } else {
      this.state = {
        school: "",
        degree: "",
        fieldOfStudy: "",
        from: "",
        to: "",
        toDisabled: false,
        current: false,
        description: "",
        activities: "",
      };
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCurrentChecked = this.handleCurrentChecked.bind(this);
    this.cancelAddEducation = this.cancelAddEducation.bind(this);
    this.deleteEducation = this.deleteEducation.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearAddEducationErrors();
    this.props.clearEditEducationErrors();
    this.props.clearDeleteEducationErrors();
  }

  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value,
    });
  }

  handleCurrentChecked(event) {
    this.setState((state, props) => ({
      toDisabled: !state.toDisabled,
      current: !state.current,
      to: !state.toDisabled ? "" : state.to,
    }));
  }

  cancelAddEducation(event) {
    this.props.onModalAlteration("");
  }

  deleteEducation(event) {
    event.preventDefault();
    const educationData = {
      entryId: this.props.entryId,
    };

    this.props.deleteEducation(educationData).then(() => {
      if (this.props.profile.delete_education_status === "succeeded") {
        this.props.onModalAlteration("");
      }
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const educationData = {
      school: this.state.school,
      degree: this.state.degree,
      fieldOfStudy: this.state.fieldOfStudy,
      from: this.state.from,
      to: this.state.to,
      current: this.state.current,
      description: this.state.description,
      activities: this.state.activities,
    };

    if (this.state.editing) {
      educationData.entryId = this.props.entryId;
      this.props.editEducation(educationData).then(() => {
        if (this.props.profile.edit_education_status === "succeeded") {
          this.props.onModalAlteration("");
        }
      });
    } else {
      this.props.addEducation(educationData).then(() => {
        if (this.props.profile.add_education_status === "succeeded") {
          this.props.onModalAlteration("");
        }
      });
    }
  }

  render() {
    let errors = this.props.profile.add_education_errors
      ? this.props.profile.add_education_errors
      : {};

    if (this.state.editing) {
      errors = this.props.profile.edit_education_errors
        ? this.props.profile.edit_education_errors
        : {};
    }

    return (
      <div className="modal-overlay" onClick={this.cancelAddEducation}>
        <div
          className="modal__content card"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="card-header">
            Add education
            <a
              href="#"
              className="modal__exit-icon"
              onClick={this.cancelAddEducation}
            >
              <i className="fas fa-times"></i>
            </a>
          </div>
          <div className="card-body">
            <form onSubmit={this.handleSubmit} noValidate>
              <InputFormGroup
                htmlFor="school"
                label="School"
                name="school"
                type="text"
                error={errors.school}
                id="school"
                value={this.state.school}
                onChange={this.handleInputChange}
                required={true}
              />

              <InputFormGroup
                htmlFor="degree"
                label="Degree"
                name="degree"
                type="text"
                error={errors.degree}
                id="degree"
                value={this.state.degree}
                onChange={this.handleInputChange}
                required={true}
              />

              <InputFormGroup
                htmlFor="fieldOfStudy"
                label="Field of study"
                name="fieldOfStudy"
                type="text"
                error={errors.fieldOfStudy}
                id="fieldOfStudy"
                value={this.state.fieldOfStudy}
                onChange={this.handleInputChange}
                required={true}
              />

              <InputFormGroup
                htmlFor="from"
                label="From"
                name="from"
                type="date"
                error={errors.from}
                id="from"
                value={this.state.from}
                onChange={this.handleInputChange}
                required={true}
              />

              <InputFormGroup
                htmlFor="to"
                label="To"
                name="to"
                type="date"
                error={errors.to}
                id="to"
                value={this.state.to}
                onChange={this.handleInputChange}
                disabled={this.state.toDisabled}
                required={true}
              />

              <div className="form-group form-check">
                <input
                  name="current"
                  type="checkbox"
                  className={classNames("form-check-input", {
                    "is-invalid": errors.current,
                  })}
                  id="current"
                  value={this.state.current}
                  checked={this.state.current}
                  onChange={this.handleCurrentChecked}
                />
                <label className="form-check-label" htmlFor="current">
                  I'm currently studying here
                </label>
                {errors.current && (
                  <div id="current" className="invalid-feedback">
                    {errors.current.msg}
                  </div>
                )}
              </div>

              <TextareaFormGroup
                htmlFor="description"
                label="Description"
                name="description"
                rows="5"
                error={errors.description}
                value={this.state.description}
                onChange={this.handleInputChange}
              />

              <TextareaFormGroup
                htmlFor="activities"
                label="Clubs and activities"
                name="activities"
                rows="5"
                error={errors.activities}
                value={this.state.activities}
                onChange={this.handleInputChange}
              />

              <div className="float-right mt-4 mb-4">
                {this.state.editing ? (
                  <button
                    type="button"
                    className="btn btn-secondary mr-4"
                    onClick={this.deleteEducation}
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary mr-4"
                    onClick={this.cancelAddEducation}
                  >
                    Cancel
                  </button>
                )}

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

// Select data from store that the AddEducationModal component needs; each field with become a prop in the AddEducationModal component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the AddEducationModal component
 */
const mapDispatchToProps = {
  addEducation,
  clearAddEducationErrors,
  editEducation,
  clearEditEducationErrors,
  deleteEducation,
  clearDeleteEducationErrors,
};

// Connect the AddEducationModal component to the Redux store
export default connect(mapStateToProps, mapDispatchToProps)(AddEducationModal);
