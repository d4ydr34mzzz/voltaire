import React, { Component } from "react";
import { connect } from "react-redux";
import { addAbout, clearAddAboutErrors } from "./profileSlice.js";
import TextareaFormGroup from "../forms/TextareaFormGroup.js";

class AddAboutModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bio: "",
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.cancelAddAbout = this.cancelAddAbout.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearAddAboutErrors();
  }

  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value,
    });
  }

  cancelAddAbout(event) {
    this.props.onModalAlteration("");
  }

  handleSubmit(event) {
    event.preventDefault();

    const aboutData = {
      bio: this.state.bio,
    };

    this.props.addAbout(aboutData).then(() => {
      if (this.props.profile.add_about_status === "succeeded") {
        this.props.onModalAlteration("");
      }
    });
  }

  render() {
    return (
      <div className="modal-overlay" onClick={this.cancelAddAbout}>
        <div
          className="modal__content card"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="card-header">
            About me
            <a
              href="#"
              className="modal__exit-icon"
              onClick={this.cancelAddAbout}
            >
              <i className="fas fa-times"></i>
            </a>
          </div>
          <div className="card-body">
            <form onSubmit={this.handleSubmit} noValidate>
              <TextareaFormGroup
                htmlFor="bio"
                name="bio"
                rows="10"
                value={this.state.bio}
                onChange={this.handleInputChange}
              />

              <div className="float-right mt-4 mb-4">
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

// Select data from store that the AddAboutModal component needs; each field with become a prop in the AddAboutModal component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the AddAboutModal component
 */
const mapDispatchToProps = {
  addAbout,
  clearAddAboutErrors,
};

// Connect the AddAboutModal component to the Redux store
export default connect(mapStateToProps, mapDispatchToProps)(AddAboutModal);
