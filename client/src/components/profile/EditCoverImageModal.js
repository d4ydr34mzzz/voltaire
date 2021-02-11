import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchCurrentUser, clearErrors } from "../auth/authSlice.js";
import { editCoverImage, clearEditCoverImageErrors } from "./profileSlice.js";
import ConfirmDiscardChangesModal from "./ConfirmDiscardChangesModal.js";
import AvatarEditor from "react-avatar-editor";

class EditCoverImageModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coverImage:
        this.props.auth &&
        this.props.auth.user &&
        this.props.auth.user.coverImage
          ? this.props.auth.user.coverImage
          : "",
      coverImageDataURL: "",
      croppingRectangle:
        this.props.auth &&
        this.props.auth.user &&
        this.props.auth.user.coverImageCroppingRectangle
          ? this.props.auth.user.coverImageCroppingRectangle
          : "",
      uploadedImageDataURL: "",
      imageUploadErrors: {
        fileType: "",
        fileSize: "",
      },
      editorWidth: 640,
      editorHeight: 320,
      zoom: 1,
      changesMade: false,
      discardChangesModalActive: false,
      /* TODO: have x and y for editor in state as well */
    };

    this.props.fetchCurrentUser();

    this.updateEditorDimensions = this.updateEditorDimensions.bind(this);
    this.handleUploadImageClick = this.handleUploadImageClick.bind(this);
    this.handleRemoveImageClick = this.handleRemoveImageClick.bind(this);
    this.handleFileInputChange = this.handleFileInputChange.bind(this);
    this.handleZoomChange = this.handleZoomChange.bind(this);
    this.setEditorRef = this.setEditorRef.bind(this);
    this.cancelEditCoverImage = this.cancelEditCoverImage.bind(this);
    this.handleDiscardChangesConfirmation = this.handleDiscardChangesConfirmation.bind(
      this
    );
    this.handleDiscardChangesCancellation = this.handleDiscardChangesCancellation.bind(
      this
    );
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  updateEditorDimensions() {
    let imageEditorContainer = document.querySelector(
      ".js-image-editor-container"
    );
    this.setState({
      editorWidth: imageEditorContainer.clientWidth - 50,
      editorHeight: (imageEditorContainer.clientWidth - 50) / 2,
    });
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

    window.addEventListener("resize", this.updateEditorDimensions);

    if (this.state.coverImage) {
      loadImageXHR(this.state.coverImage).then((blob) => {
        this.setState({ coverImageDataURL: URL.createObjectURL(blob) });
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateEditorDimensions);
    this.props.clearErrors();
    this.props.clearEditCoverImageErrors();
  }

  handleUploadImageClick(event) {
    document.getElementById("coverImage").click();
  }

  handleRemoveImageClick(event) {
    document.getElementById("coverImage").value = "";
    this.setState({
      coverImage: "",
      uploadedImageDataURL: "",
      changesMade: true,
    });
  }

  handleFileInputChange(event) {
    let file = document.getElementById("coverImage").files[0];
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

  cancelEditCoverImage(event) {
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

  handleSubmit(event) {
    event.preventDefault();

    function createBlob(canvas) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(function (blob) {
          resolve(blob);
        });
      });
    }

    let coverImage;
    let coverImageCropped;
    let croppingRectangle;

    if (this.state.coverImage) {
      /* User wants to change the croppingRectangle for the previously uploaded image */
      coverImage = undefined;
      coverImageCropped = this.editor.getImageScaledToCanvas();
      croppingRectangle = JSON.stringify(this.editor.getCroppingRect());
    } else if (!this.state.coverImage && this.state.uploadedImageDataURL) {
      /* User wants to upload a new cover image */
      coverImage = document.getElementById("coverImage").files[0];
      coverImageCropped = this.editor.getImageScaledToCanvas();
      croppingRectangle = JSON.stringify(this.editor.getCroppingRect());
    } else if (!(this.state.coverImage && this.state.uploadedImageDataURL)) {
      /* User wants to remove their current cover image */
      coverImage = undefined;
      coverImageCropped = undefined;
      croppingRectangle = undefined;
    }

    let coverImageData = {
      coverImage: coverImage,
      coverImageCropped: coverImageCropped,
      croppingRectangle: croppingRectangle,
    };

    if (coverImageCropped) {
      let fileName;
      let fileType;

      if (coverImage) {
        fileName = coverImage.name;
        fileType = coverImage.type;
      } else {
        /* Reference: https://stackoverflow.com/a/1203361 */
        let fileExtension = this.state.coverImage.split(".");
        if (
          fileExtension.length === 1 ||
          (fileExtension[0] === "" && fileExtension.length === 2)
        ) {
          fileExtension = "";
        } else {
          fileExtension = fileExtension.pop();
        }
        fileName =
          "coverImageCropped" + (fileExtension ? "." + fileExtension : "");
        fileType = "image/" + (fileExtension ? fileExtension : "");
      }

      createBlob(coverImageCropped).then((blob) => {
        coverImageData["coverImageCropped"] = new File([blob], fileName, {
          type: fileType,
        });

        this.props.editCoverImage(coverImageData).then(() => {
          if (this.props.profile.edit_cover_image_status === "succeeded") {
            this.props.onModalAlteration("");
          }
        });
      });
    } else {
      this.props.editCoverImage(coverImageData).then(() => {
        if (this.props.profile.edit_cover_image_status === "succeeded") {
          this.props.onModalAlteration("");
        }
      });
    }
  }

  render() {
    let errors =
      this.props.profile && this.props.profile.edit_profile_picture_errors
        ? this.props.profile.edit_profile_picture_errors
        : {};

    return (
      <div>
        <div className="modal-overlay" onMouseDown={this.cancelEditCoverImage}>
          <div
            className="modal__content modal__content--edit-profile-picture card"
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="card-header">
              Cover image
              <a
                href="#"
                className="modal__exit-icon"
                onClick={this.cancelEditCoverImage}
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
            {errors.coverImage ? (
              <div className="alert alert-danger mb-0" role="alert">
                {errors.coverImage.msg}
              </div>
            ) : null}
            <div className="profile-picture-editor js-image-editor-container">
              {this.state.coverImage || this.state.uploadedImageDataURL ? (
                <div>
                  <AvatarEditor
                    ref={this.setEditorRef}
                    image={
                      this.state.coverImage
                        ? this.state.coverImageDataURL
                        : this.state.uploadedImageDataURL
                    }
                    width={this.state.editorWidth}
                    height={this.state.editorHeight}
                    border={[0, 25]}
                    color={[255, 255, 255, 0.6]}
                    scale={0.9 + this.state.zoom / 10}
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
                  {this.state.coverImage || this.state.uploadedImageDataURL ? (
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
                  id="coverImage"
                  name="coverImage"
                  type="file"
                  className="invisible"
                  accept=".jpg, .jpeg, .png"
                  onChange={this.handleFileInputChange}
                ></input>
                <div className="float-right mt-4 mb-4">
                  <button
                    type="button"
                    className="btn btn-secondary mr-4"
                    onClick={this.cancelEditCoverImage}
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
      </div>
    );
  }
}

// Select data from store that the EditCoverImageModal component needs; each field with become a prop in the EditCoverImageModal component
const mapStateToProps = (state) => ({
  auth: state.auth,
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the EditCoverImageModal component
 */
const mapDispatchToProps = {
  fetchCurrentUser,
  clearErrors,
  editCoverImage,
  clearEditCoverImageErrors,
};

// Connect the EditCoverImageModal component to the Redux store
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditCoverImageModal);
