import React, { Component } from "react";
import CoverImageSection from "./CoverImageSection.js";

class GeneralInformationSection extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    let buttonClicked = event.currentTarget.dataset.button;
    switch (buttonClicked) {
      case "profilePicture":
        this.props.onModalAlteration("editProfilePicture");
        break;
      case "edit":
        this.props.onModalAlteration("generalInformation");
        break;
    }
  }

  render() {
    return (
      <div className="profile__section--top">
        <div className="profile__cover-image-header">
          <CoverImageSection
            coverImageCropped={this.props.coverImageCropped}
            onModalAlteration={this.props.onModalAlteration}
          />
        </div>
        <div className="profile__section profile__section--general-information">
          <div className="container container--left-padding-compensation">
            <div className="row mt-4">
              <div className="col-md-3 col-xl-2">
                <div className="position-relative">
                  <img
                    src={
                      this.props.profilePictureCropped
                        ? this.props.profilePictureCropped
                        : this.props.user.picture
                    }
                    alt=""
                    className="rounded-circle profile__profile-picture"
                  ></img>
                  {this.props.onModalAlteration ? (
                    <span
                      className="fa-stack profile__edit-profile-picture-button"
                      role="button"
                      tabIndex="0"
                      onClick={this.handleClick}
                      data-button="profilePicture"
                    >
                      <i className="fa fa-circle fa-stack-2x edit-picture-button__backdrop"></i>
                      <i className="fas fa-camera fa-stack-1x edit-picture-button__icon"></i>
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="col-md-9 col-xl-10 pt-5 pt-md-0">
                {this.props.onModalAlteration ? (
                  <a
                    href="#"
                    className="profile__edit-icon profile__edit-icon--right-padding-compensation"
                    onClick={this.handleClick}
                    data-button="edit"
                  >
                    <i className="fas fa-pen"></i>
                  </a>
                ) : null}
                <div className="pl-3">
                  <h1 className="section__name mb-3">
                    {this.props.user.firstName} {this.props.user.lastName}
                  </h1>
                  <h2 className="section__subheading section__subheading--header">
                    {this.props.header}
                  </h2>
                  <h3 className="section__subheading section__subheading--location">
                    {this.props.location}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GeneralInformationSection;
