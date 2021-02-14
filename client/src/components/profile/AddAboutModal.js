import React, { Component } from "react";
import { connect } from "react-redux";
import { addAbout, clearAddAboutErrors } from "./profileSlice.js";
import ConfirmDiscardChangesModal from "./ConfirmDiscardChangesModal.js";
import LoadingIconModal from "./LoadingIconModal.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

class AddAboutModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bio: this.props.profile ? this.props.profile.profile.bio : "",
      changesMade: false,
      discardChangesModalActive: false,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleBioChange = this.handleBioChange.bind(this);
    this.cancelAddAbout = this.cancelAddAbout.bind(this);
    this.handleDiscardChangesConfirmation = this.handleDiscardChangesConfirmation.bind(
      this
    );
    this.handleDiscardChangesCancellation = this.handleDiscardChangesCancellation.bind(
      this
    );
    this.handleCloseLoadingIconModal = this.handleCloseLoadingIconModal.bind(
      this
    );
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

  handleBioChange(value) {
    this.setState((state, props) => ({
      bio: value,
      changesMade: state.bio !== value ? true : false,
    }));
  }

  cancelAddAbout(event) {
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

  handleCloseLoadingIconModal() {
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
    let errors = this.props.profile.add_about_errors
      ? this.props.profile.add_about_errors
      : {};

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
        <div className="modal-overlay" onMouseDown={this.cancelAddAbout}>
          <div
            className="modal__content card"
            onMouseDown={(event) => {
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
              {errors.error ? (
                <div class="alert alert-danger" role="alert">
                  {errors.error.msg}
                </div>
              ) : null}
              <form onSubmit={this.handleSubmit} noValidate>
                <div className="form-group">
                  <ReactQuill
                    className="quill--about"
                    theme="snow"
                    modules={modules}
                    value={this.state.bio}
                    onChange={this.handleBioChange}
                  />
                  {errors.bio && (
                    <div className="invalid-feedback d-block">
                      {errors.bio.msg}
                    </div>
                  )}
                </div>

                <div className="float-right mt-4 mb-4">
                  <button
                    type="button"
                    className="btn btn-secondary mr-4"
                    onClick={this.cancelAddAbout}
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
        {this.state.discardChangesModalActive ? (
          <ConfirmDiscardChangesModal
            onDiscardChangesConfirmation={this.handleDiscardChangesConfirmation}
            onDiscardChangesCancellation={this.handleDiscardChangesCancellation}
          />
        ) : null}
        {this.props.profile &&
        this.props.profile.add_about_status === "loading" ? (
          <LoadingIconModal
            onCloseLoadingIconModal={this.handleCloseLoadingIconModal}
          />
        ) : null}
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
