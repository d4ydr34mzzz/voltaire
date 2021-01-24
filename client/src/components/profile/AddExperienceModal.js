import React, { Component } from "react";
import { connect } from "react-redux";
import {
  addExperience,
  clearAddExperienceErrors,
  editExperience,
  clearEditExperienceErrors,
  deleteExperience,
  clearDeleteExperienceErrors,
} from "./profileSlice.js";
import InputFormGroup from "../forms/InputFormGroup.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import classNames from "classnames";

class AddExperienceModal extends Component {
  constructor(props) {
    super(props);

    if (this.props.entryId) {
      let experiences = [];
      let experience = {};

      if (
        this.props.profile &&
        this.props.profile.profile &&
        this.props.profile.profile.experience
      ) {
        experiences = this.props.profile.profile.experience;
      }

      experience = experiences.find(
        (experience) => experience._id === this.props.entryId
      );

      if (experience) {
        this.state = {
          editing: true,
          title: experience.title ? experience.title : "",
          company: experience.company ? experience.company : "",
          location: experience.location ? experience.location : "",
          from: experience.from ? experience.from.split("T")[0] : "",
          to: experience.to ? experience.to.split("T")[0] : "",
          toDisabled: experience.to ? false : true,
          current: experience.current ? true : false,
          description: experience.description ? experience.description : "",
        };
      } else {
        this.state = {
          title: "",
          company: "",
          location: "",
          from: "",
          to: "",
          toDisabled: false,
          current: false,
          description: "",
        };
      }
    } else {
      this.state = {
        title: "",
        company: "",
        location: "",
        from: "",
        to: "",
        toDisabled: false,
        current: false,
        description: "",
      };
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleCurrentChecked = this.handleCurrentChecked.bind(this);
    this.cancelAddExperience = this.cancelAddExperience.bind(this);
    this.deleteExperience = this.deleteExperience.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearAddExperienceErrors();
    this.props.clearEditExperienceErrors();
    this.props.clearDeleteExperienceErrors();
  }

  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value,
    });
  }

  handleDescriptionChange(value) {
    this.setState({ description: value });
  }

  handleCurrentChecked(event) {
    this.setState((state, props) => ({
      toDisabled: !state.toDisabled,
      current: !state.current,
      to: !state.toDisabled ? "" : state.to,
    }));
  }

  cancelAddExperience(event) {
    event.preventDefault();
    this.props.onModalAlteration("");
  }

  deleteExperience(event) {
    event.preventDefault();
    this.props.clearEditExperienceErrors();

    const experienceData = {
      entryId: this.props.entryId,
    };

    this.props.deleteExperience(experienceData).then(() => {
      if (this.props.profile.delete_experience_status === "succeeded") {
        this.props.onModalAlteration("");
      }
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.editing) {
      this.props.clearDeleteExperienceErrors();
    }

    const experienceData = {
      title: this.state.title,
      company: this.state.company,
      location: this.state.location,
      from: this.state.from,
      to: this.state.to,
      current: this.state.current,
      description: this.state.description,
    };

    if (this.state.editing) {
      experienceData.entryId = this.props.entryId;
      this.props.editExperience(experienceData).then(() => {
        if (this.props.profile.edit_experience_status === "succeeded") {
          this.props.onModalAlteration("");
        }
      });
    } else {
      this.props.addExperience(experienceData).then(() => {
        if (this.props.profile.add_experience_status === "succeeded") {
          this.props.onModalAlteration("");
        }
      });
    }
  }

  render() {
    let errors = this.props.profile.add_experience_errors
      ? this.props.profile.add_experience_errors
      : {};

    if (this.state.editing) {
      errors = this.props.profile.edit_experience_errors
        ? this.props.profile.edit_experience_errors
        : {};

      if (
        Object.keys(this.props.profile.delete_experience_errors).length !== 0
      ) {
        errors = this.props.profile.delete_experience_errors;
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
      <div className="modal-overlay" onClick={this.cancelAddExperience}>
        <div
          className="modal__content card"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="card-header">
            {this.state.editing ? "Edit Experience" : "Add Experience"}
            <a
              href="#"
              className="modal__exit-icon"
              onClick={this.cancelAddExperience}
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
                htmlFor="title"
                label="Title"
                name="title"
                type="text"
                error={errors.title}
                id="title"
                value={this.state.title}
                onChange={this.handleInputChange}
                required={true}
              />

              <InputFormGroup
                htmlFor="company"
                label="Company"
                name="company"
                type="text"
                error={errors.company}
                id="company"
                value={this.state.company}
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
                  I'm currently working here
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

              <div className="float-right mt-4 mb-4">
                {this.state.editing ? (
                  <button
                    type="button"
                    className="btn btn-secondary mr-4"
                    onClick={this.deleteExperience}
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary mr-4"
                    onClick={this.cancelAddExperience}
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

// Select data from store that the AddExperienceModal component needs; each field with become a prop in the AddExperienceModal component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the AddExperienceModal component
 */
const mapDispatchToProps = {
  addExperience,
  clearAddExperienceErrors,
  editExperience,
  clearEditExperienceErrors,
  deleteExperience,
  clearDeleteExperienceErrors,
};

// Connect the AddExperienceModal component to the Redux store
export default connect(mapStateToProps, mapDispatchToProps)(AddExperienceModal);
