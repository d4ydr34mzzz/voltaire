import React, { Component } from "react";

class CoverImageSection extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    if (this.props.coverImageCropped) {
      document.querySelector(
        ".js-profile__cover-image-overlay"
      ).style.backgroundImage = "url('" + this.props.coverImageCropped + "')";
    }
  }

  componentDidUpdate() {
    if (this.props.coverImageCropped) {
      document.querySelector(
        ".js-profile__cover-image-overlay"
      ).style.backgroundImage = "url('" + this.props.coverImageCropped + "')";
    }
  }

  handleClick(event) {
    event.preventDefault();
    this.props.onModalAlteration("editCoverImage");
  }

  render() {
    if (this.props.coverImageCropped) {
      return (
        <div className="profile__cover-image-overlay js-profile__cover-image-overlay">
          {this.props.onModalAlteration ? (
            <span
              className="fa-stack profile__edit-cover-image-button"
              role="button"
              tabIndex="0"
              onClick={this.handleClick}
            >
              <i className="fa fa-circle fa-stack-2x edit-picture-button__backdrop"></i>
              <i className="fas fa-camera fa-stack-1x edit-picture-button__icon"></i>
            </span>
          ) : null}
        </div>
      );
    } else {
      return this.props.onModalAlteration ? (
        <span
          className="fa-stack profile__edit-cover-image-button"
          role="button"
          tabIndex="0"
          onClick={this.handleClick}
        >
          <i className="fa fa-circle fa-stack-2x edit-picture-button__backdrop"></i>
          <i className="fas fa-camera fa-stack-1x edit-picture-button__icon"></i>
        </span>
      ) : null;
    }
  }
}

export default CoverImageSection;
