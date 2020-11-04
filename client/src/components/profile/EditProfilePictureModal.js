import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchCurrentUser, clearErrors } from "../auth/authSlice.js";
import {
  editProfilePicture,
  clearEditProfilePictureErrors,
} from "./profileSlice.js";
import AvatarEditor from "react-avatar-editor";

class EditProfilePictureModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profilePicture:
        this.props.auth &&
        this.props.auth.user &&
        this.props.auth.user.profilePicture
          ? this.props.auth.user.profilePicture
          : "",
      croppingRectangle:
        this.props.auth &&
        this.props.auth.user &&
        this.props.auth.user.profilePictureCroppingRectangle
          ? this.props.auth.user.profilePictureCroppingRectangle
          : "",
      uploadedImageDataURL: "",
      imageUploadErrors: {
        fileType: "",
        fileSize: "",
      },
      zoom: 1,
      /* TODO: have x and y for editor in state as well */
    };

    this.props.fetchCurrentUser();

    this.handleUploadImageClick = this.handleUploadImageClick.bind(this);
    this.handleRemoveImageClick = this.handleRemoveImageClick.bind(this);
    this.handleFileInputChange = this.handleFileInputChange.bind(this);
    this.handleZoomChange = this.handleZoomChange.bind(this);
    this.setEditorRef = this.setEditorRef.bind(this);
    this.cancelEditProfilePicture = this.cancelEditProfilePicture.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearErrors();
    this.props.clearEditProfilePictureErrors();
  }

  handleUploadImageClick(event) {
    document.getElementById("profilePicture").click();
  }

  handleRemoveImageClick(event) {
    document.getElementById("profilePicture").value = "";
    this.setState({
      profilePicture: "",
      uploadedImageDataURL: "",
    });
  }

  handleFileInputChange(event) {
    let file = document.getElementById("profilePicture").files[0];
    if (/\.(jpe?g|png)$/i.test(file.name)) {
      if (file.size / 1048576 /* MiB */ > 10) {
        this.setState({
          imageUploadErrors: {
            fileSize: "File too large",
          },
        });
      } else {
        let reader = new FileReader();
        reader.onload = (e) => {
          this.setState({
            uploadedImageDataURL: reader.result,
            imageUploadErrors: {},
          });
        };
        reader.readAsDataURL(file);
      }
    } else {
      this.setState({
        imageUploadErrors: {
          fileType: "Invalid file type",
        },
      });
    }
  }

  handleZoomChange(event) {
    this.setState({
      zoom: Number(event.target.value),
    });
  }

  setEditorRef(editor) {
    this.editor = editor;
  }

  cancelEditProfilePicture(event) {
    this.props.onModalAlteration("");
  }

  handleSubmit(event) {
    event.preventDefault();

    let profilePicture;
    let croppingRectangle;

    if (this.state.profilePicture) {
      /* User wants to change the croppingRectangle for the previously uploaded image */
      profilePicture = undefined;
      croppingRectangle = JSON.stringify(this.editor.getCroppingRect());
    } else if (!this.state.profilePicture && this.state.uploadedImageDataURL) {
      /* User wants to upload a new profile image */
      profilePicture = document.getElementById("profilePicture").files[0];
      croppingRectangle = JSON.stringify(this.editor.getCroppingRect());
    } else if (
      !(this.state.profilePicture && this.state.uploadedImageDataURL)
    ) {
      /* User wants to remove their current profile picture */
      profilePicture = undefined;
      croppingRectangle = undefined;
    }

    const profilePictureData = {
      profilePicture: profilePicture,
      croppingRectangle: croppingRectangle,
    };

    this.props.editProfilePicture(profilePictureData).then(() => {
      if (this.props.profile.edit_profile_picture_status === "succeeded") {
        this.props.onModalAlteration("");
      }
    });
  }

  render() {
    let errors = this.props.profile.edit_profile_picture_errors
      ? this.props.profile.edit_profile_picture_errors
      : {};

    return (
      <div className="modal-overlay" onClick={this.cancelEditProfilePicture}>
        <div
          className="modal__content modal__content--edit-profile-picture card"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="card-header">
            Profile picture
            <a
              href="#"
              className="modal__exit-icon"
              onClick={this.cancelEditProfilePicture}
            >
              <i className="fas fa-times"></i>
            </a>
          </div>
          {this.state.imageUploadErrors.fileType ? (
            <div className="alert alert-danger mb-0" role="alert">
              {this.state.imageUploadErrors.fileType}
            </div>
          ) : null}
          {this.state.imageUploadErrors.fileSize ? (
            <div className="alert alert-danger mb-0" role="alert">
              {this.state.imageUploadErrors.fileSize}
            </div>
          ) : null}
          {errors.profilePicture ? (
            <div className="alert alert-danger mb-0" role="alert">
              {errors.profilePicture.msg}
            </div>
          ) : null}
          <div className="profile-picture-editor">
            {this.state.profilePicture || this.state.uploadedImageDataURL ? (
              <div>
                <AvatarEditor
                  ref={this.setEditorRef}
                  image={
                    this.state.profilePicture
                      ? this.state.profilePicture
                      : this.state.uploadedImageDataURL
                  }
                  width={320}
                  height={320}
                  border={0}
                  borderRadius={10000}
                  color={[255, 255, 255, 0.6]}
                  scale={0.9 + this.state.zoom / 10}
                  rotate={0}
                />
                <div className="profile-picture-editor__zoom-selector">
                  <div className="zoom-selector__zoom-out-button">
                    <i className="fas fa-minus" aria-hidden="true"></i>
                  </div>
                  <div className="zoom-selector__slider-container">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      className="slider-container__slider"
                      id="zoom"
                      value={this.state.zoom}
                      onChange={this.handleZoomChange}
                    />
                  </div>
                  <div className="zoom-selector__zoom-in-button">
                    <i className="fas fa-plus" aria-hidden="true"></i>
                  </div>
                </div>
                {this.state.profilePicture ||
                this.state.uploadedImageDataURL ? (
                  <span
                    className="profile-picture-editor__remove-image-button"
                    role="button"
                    tabIndex="0"
                    onClick={this.handleRemoveImageClick}
                  >
                    <i className="far fa-trash-alt" aria-hidden="true"></i>
                  </span>
                ) : null}
              </div>
            ) : (
              <div
                className="profile-picture-editor__upload-photo-message"
                role="button"
                tabIndex="0"
                onClick={this.handleUploadImageClick}
              >
                <i className="fas fa-image upload-photo-message__icon"></i>
                <p>Select a photo to get started</p>
              </div>
            )}
          </div>
          <hr className="mt-0" />
          <div className="card-body">
            <div className="profile-picture-editor__upload-information">
              <div className="row">
                <div className="col-sm-6">
                  <p className="upload-information__attribute-name">
                    Supported formats:
                  </p>
                </div>
                <div className="col-sm-6">
                  <p>JPG / JPEG / PNG</p>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6">
                  <p className="upload-information__attribute-name">
                    File size limit:
                  </p>
                </div>
                <div className="col-sm-6">
                  <p>10 MiB</p>
                </div>
              </div>
            </div>

            <form onSubmit={this.handleSubmit} noValidate>
              <input
                id="profilePicture"
                name="profilePicture"
                type="file"
                className="invisible"
                accept=".jpg, .jpeg, .png"
                onChange={this.handleFileInputChange}
              ></input>
              <div className="float-right mt-4 mb-4">
                <button
                  type="button"
                  className="btn btn-secondary mr-4"
                  onClick={this.cancelEditProfilePicture}
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

// Select data from store that the EditProfilePictureModal component needs; each field with become a prop in the EditProfilePictureModal component
const mapStateToProps = (state) => ({
  auth: state.auth,
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the EditProfilePictureModal component
 */
const mapDispatchToProps = {
  fetchCurrentUser,
  clearErrors,
  editProfilePicture,
  clearEditProfilePictureErrors,
};

// Connect the EditProfilePictureModal component to the Redux store
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditProfilePictureModal);
