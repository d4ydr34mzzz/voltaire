import React, { Component } from "react";
import { connect } from "react-redux";
import AvatarEditor from "react-avatar-editor";

class EditProfilePictureModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profilePicture: this.props.profile
        ? this.props.profile.profile.profilePicture
        : "",
      uploadedImageDataURL: "",
      imageUploadErrors: {
        fileType: "",
        fileSize: "",
      },
    };

    this.x1 = 0;
    this.x2 = 0;
    this.handle = undefined;

    this.handleUploadImageClick = this.handleUploadImageClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleMouseDown = this.handleMouseDown.bind(this);
    this.cancelEditProfilePicture = this.cancelEditProfilePicture.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    // TODO
  }

  handleUploadImageClick(event) {
    document.getElementById("profilePicture").click();
  }

  handleInputChange(event) {
    let file = document.getElementById("profilePicture").files[0];
    this.setState({ fileSize: file.size / 1048576 });
    if (/\.(jpe?g|png)$/i.test(file.name)) {
      if (file.size / 1048576 > 10) {
        this.setState({
          imageUploadErrors: {
            fileSize: "The selected file is too large",
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

  cancelEditProfilePicture(event) {
    this.props.onModalAlteration("");
  }

  handleSubmit(event) {
    event.preventDefault();
    // TODO
    console.log("Upload image and save ref in database");
  }

  render() {
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
          <div className="profile-picture-editor">
            {this.state.profilePicture || this.state.uploadedImageDataURL ? (
              <div>
                <AvatarEditor
                  image={this.state.uploadedImageDataURL}
                  width={320}
                  height={320}
                  border={0}
                  borderRadius={10000}
                  color={[255, 255, 255, 0.6]}
                  scale={1}
                  rotate={0}
                />
                <div className="profile-picture-editor__zoom-selector">
                  <div className="zoom-selector__zoom-out-button">
                    <i className="fas fa-minus" aria-hidden="true"></i>
                  </div>
                  <div class="zoom-selector__slider-container">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      class="slider-container__slider"
                      id="myRange"
                    />
                  </div>
                  <div className="zoom-selector__zoom-in-button">
                    <i className="fas fa-plus" aria-hidden="true"></i>
                  </div>
                </div>
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
                onChange={this.handleInputChange}
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
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the EditProfilePictureModal component
 */
const mapDispatchToProps = {};

// Connect the EditProfilePictureModal component to the Redux store
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditProfilePictureModal);
