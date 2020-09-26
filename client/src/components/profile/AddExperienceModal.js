import React, { Component } from "react";
import { connect } from "react-redux";
import { addExperience, clearAddExperienceErrors } from "./profileSlice.js";
import InputFormGroup from "../forms/InputFormGroup.js";
import TextareaFormGroup from "../forms/TextareaFormGroup.js";
import classNames from "classnames";

class AddExperienceModal extends Component {
  constructor(props) {
    super(props);
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

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCurrentChecked = this.handleCurrentChecked.bind(this);
    this.cancelAddExperience = this.cancelAddExperience.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearAddExperienceErrors();
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
    this.setState({
      toDisabled: !this.state.toDisabled,
      current: !this.state.current,
    });

    if (this.state.toDisabled) {
      this.setState({
        to: "",
      });
    }
  }

  cancelAddExperience(event) {
    this.props.onModalAlteration("");
  }

  handleSubmit(event) {
    event.preventDefault();

    const experienceData = {
      title: this.state.title,
      company: this.state.company,
      location: this.state.location,
      from: this.state.from,
      to: this.state.to,
      current: this.state.current,
      description: this.state.description,
    };

    this.props.addExperience(experienceData).then(() => {
      if (this.props.profile.add_experience_status === "succeeded") {
        this.props.onModalAlteration("");
      }
    });
  }

  render() {
    const errors = this.props.profile
      ? this.props.profile.add_experience_errors
      : {};
    return (
      <div className="modal-overlay" onClick={this.cancelAddExperience}>
        <div
          className="modal__content card"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="card-header">
            Add experience
            <a
              href="#"
              className="modal__exit-icon"
              onClick={this.cancelAddExperience}
            >
              <i className="fas fa-times"></i>
            </a>
          </div>
          <div className="card-body">
            <form onSubmit={this.handleSubmit}>
              <InputFormGroup
                htmlFor="title"
                label="Title"
                name="title"
                type="text"
                error={errors.title}
                id="title"
                value={this.state.title}
                onChange={this.handleInputChange}
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

              <TextareaFormGroup
                htmlFor="description"
                label="Description"
                name="description"
                rows="10"
                error={errors.description}
                value={this.state.description}
                onChange={this.handleInputChange}
              />

              <div className="float-right mt-4 mb-4">
                <button
                  type="button"
                  className="btn btn-secondary mr-4"
                  onClick={this.cancelAddExperience}
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

// Select data from store that the Profile component needs; each field with become a prop in the Profile component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the Profile component
 */
const mapDispatchToProps = {
  addExperience,
  clearAddExperienceErrors,
};

// Connect the Profile component to the Redux store
export default connect(mapStateToProps, mapDispatchToProps)(AddExperienceModal);
