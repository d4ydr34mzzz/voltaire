import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchCurrentUser, clearErrors } from "../auth/authSlice.js";
import {
  editProfilePicture,
  clearEditProfilePictureErrors,
} from "./profileSlice.js";
import ConfirmDiscardChangesModal from "./ConfirmDiscardChangesModal.js";
import LoadingIconModal from "./LoadingIconModal.js";
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
      profilePictureDataURL: "",
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
      changesMade: false,
      discardChangesModalActive: false,
      /* TODO: have x and y for editor in state as well */
    };

    this.props.fetchCurrentUser();

    this.handleUploadImageClick = this.handleUploadImageClick.bind(this);
    this.handleRemoveImageClick = this.handleRemoveImageClick.bind(this);
    this.handleFileInputChange = this.handleFileInputChange.bind(this);
    this.handleZoomChange = this.handleZoomChange.bind(this);
    this.setEditorRef = this.setEditorRef.bind(this);
    this.cancelEditProfilePicture = this.cancelEditProfilePicture.bind(this);
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

  componentDidMount() {
    function loadImageXHR(url) {
      /* Reference: https://stackoverflow.com/a/42508185 */
      return new Promise((resolve, reject) => {
        try {
          const request = new XMLHttpRequest();
          request.open("GET", url);
          request.responseType = "blob";
          request.onload = () => {
            if (request.status === 200) {
              resolve(request.response);
            } else {
              reject(request.statusText);
            }
          };
          request.onerror = () => {
            reject("An error occurred while transferring the file.");
          };
          request.send();
        } catch (error) {
          reject(error);
        }
      });
    }

    if (this.state.profilePicture) {
      loadImageXHR(this.state.profilePicture).then((blob) => {
        this.setState({ profilePictureDataURL: URL.createObjectURL(blob) });
      });
    }
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
      changesMade: true,
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
            changesMade: true,
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
      changesMade: true,
    });
  }

  setEditorRef(editor) {
    this.editor = editor;
  }

  cancelEditProfilePicture(event) {
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

    function createBlob(canvas) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(function (blob) {
          resolve(blob);
        });
      });
    }

    let profilePicture;
    let profilePictureCropped;
    let croppingRectangle;

    if (this.state.profilePicture) {
      /* User wants to change the croppingRectangle for the previously uploaded image */
      profilePicture = undefined;
      profilePictureCropped = this.editor.getImageScaledToCanvas();
      croppingRectangle = JSON.stringify(this.editor.getCroppingRect());
    } else if (!this.state.profilePicture && this.state.uploadedImageDataURL) {
      /* User wants to upload a new profile image */
      profilePicture = document.getElementById("profilePicture").files[0];
      profilePictureCropped = this.editor.getImageScaledToCanvas();
      croppingRectangle = JSON.stringify(this.editor.getCroppingRect());
    } else if (
      !(this.state.profilePicture && this.state.uploadedImageDataURL)
    ) {
      /* User wants to remove their current profile picture */
      profilePicture = undefined;
      profilePictureCropped = undefined;
      croppingRectangle = undefined;
    }

    let profilePictureData = {
      profilePicture: profilePicture,
      profilePictureCropped: profilePictureCropped,
      croppingRectangle: croppingRectangle,
    };

    if (profilePictureCropped) {
      let fileName;
      let fileType;

      if (profilePicture) {
        fileName = profilePicture.name;
        fileType = profilePicture.type;
      } else {
        /* Reference: https://stackoverflow.com/a/1203361 */
        let fileExtension = this.state.profilePicture.split(".");
        if (
          fileExtension.length === 1 ||
          (fileExtension[0] === "" && fileExtension.length === 2)
        ) {
          fileExtension = "";
        } else {
          fileExtension = fileExtension.pop();
        }
        fileName =
          "profilePictureCropped" + (fileExtension ? "." + fileExtension : "");
        fileType = "image/" + (fileExtension ? fileExtension : "");
      }

      createBlob(profilePictureCropped).then((blob) => {
        profilePictureData["profilePictureCropped"] = new File(
          [blob],
          fileName,
          { type: fileType }
        );

        this.props.editProfilePicture(profilePictureData).then(() => {
          if (this.props.profile.edit_profile_picture_status === "succeeded") {
            this.props.onModalAlteration("");
          }
        });
      });
    } else {
      this.props.editProfilePicture(profilePictureData).then(() => {
        if (this.props.profile.edit_profile_picture_status === "succeeded") {
          this.props.onModalAlteration("");
        }
      });
    }
  }

  render() {
    let errors = this.props.profile.edit_profile_picture_errors
      ? this.props.profile.edit_profile_picture_errors
      : {};

    return (
      <div>
        <div
          className="modal-overlay"
          onMouseDown={this.cancelEditProfilePicture}
        >
          <div
            className="modal__content modal__content--edit-profile-picture card"
            onMouseDown={(event) => {
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
                        ? this.state.profilePictureDataURL
                        : this.state.uploadedImageDataURL
                    }
                    width={320}
                    height={320}
                    border={0}
                    borderRadius={10000}
                    color={[255, 255, 255, 0.6]}
                    scale={0.9 + this.state.zoom / 10}
                    rotate={0}
                    onPositionChange={() => {
                      this.setState({ changesMade: true });
                    }}
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
            <div className="card-body card-body--overflow-y-auto">
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
                <div className="text-right mt-4 mb-4">
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
        {this.state.discardChangesModalActive ? (
          <ConfirmDiscardChangesModal
            onDiscardChangesConfirmation={this.handleDiscardChangesConfirmation}
            onDiscardChangesCancellation={this.handleDiscardChangesCancellation}
          />
        ) : null}
        {this.props.profile &&
        this.props.profile.edit_profile_picture_status === "loading" ? (
          <LoadingIconModal
            onCloseLoadingIconModal={this.handleCloseLoadingIconModal}
          />
        ) : null}
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
