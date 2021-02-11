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
import ConfirmDiscardChangesModal from "./ConfirmDiscardChangesModal.js";
import InputFormGroup from "../forms/InputFormGroup.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
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
          current: education.current ? true : false,
          description: education.description ? education.description : "",
          activities: education.activities ? education.activities : "",
          changesMade: false,
          discardChangesModalActive: false,
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
          changesMade: false,
          discardChangesModalActive: false,
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
        changesMade: false,
        discardChangesModalActive: false,
      };
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleActivitiesChange = this.handleActivitiesChange.bind(this);
    this.handleCurrentChecked = this.handleCurrentChecked.bind(this);
    this.cancelAddEducation = this.cancelAddEducation.bind(this);
    this.handleDiscardChangesConfirmation = this.handleDiscardChangesConfirmation.bind(
      this
    );
    this.handleDiscardChangesCancellation = this.handleDiscardChangesCancellation.bind(
      this
    );
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
      changesMade: true,
    });
  }

  handleDescriptionChange(value) {
    this.setState((state, props) => ({
      description: value,
      changesMade: state.description !== value ? true : false,
    }));
  }

  handleActivitiesChange(value) {
    this.setState((state, props) => ({
      activities: value,
      changesMade: state.activities !== value ? true : false,
    }));
  }

  handleCurrentChecked(event) {
    this.setState((state, props) => ({
      toDisabled: !state.toDisabled,
      current: !state.current,
      to: !state.toDisabled ? "" : state.to,
      changesMade: true,
    }));
  }

  cancelAddEducation(event) {
    event.preventDefault();

    if (this.state.changesMade) {
      this.setState({ discardChangesModalActive: true });
    } else {
      this.props.onModalAlteration("");
    }
  }

  handleDiscardChangesConfirmation() {
    this.props.onModalAlteration("");
  }

  handleDiscardChangesCancellation() {
    this.setState({ discardChangesModalActive: false });
  }

  deleteEducation(event) {
    event.preventDefault();
    this.props.clearEditEducationErrors();

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
    if (this.state.editing) {
      this.props.clearDeleteEducationErrors();
    }

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

      if (
        Object.keys(this.props.profile.delete_education_errors).length !== 0
      ) {
        errors = this.props.profile.delete_education_errors;
      }
    }

    let modules = {
      toolbar: [
        ["bold", "italic", "underline"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
      ],
    };

    return (
      <div>
        <div className="modal-overlay" onMouseDown={this.cancelAddEducation}>
          <div
            className="modal__content card"
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="card-header">
              {this.state.editing ? "Edit Education" : "Add Education"}
              <a
                href="#"
                className="modal__exit-icon"
                onClick={this.cancelAddEducation}
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

                <div className="form-group">
                  <label>Description</label>
                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    value={this.state.description}
                    onChange={this.handleDescriptionChange}
                  />
                  {errors.description && (
                    <div className="invalid-feedback d-block">
                      {errors.description.msg}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Clubs and activities</label>
                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    value={this.state.activities}
                    onChange={this.handleActivitiesChange}
                  />
                  {errors.activities && (
                    <div className="invalid-feedback d-block">
                      {errors.activities.msg}
                    </div>
                  )}
                </div>

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
        {this.state.discardChangesModalActive ? (
          <ConfirmDiscardChangesModal
            onDiscardChangesConfirmation={this.handleDiscardChangesConfirmation}
            onDiscardChangesCancellation={this.handleDiscardChangesCancellation}
          />
        ) : null}
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
