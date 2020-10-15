import React, { Component } from "react";

class GeneralInformationSection extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    this.props.onModalAlteration("generalInformation");
  }

  render() {
    return (
      <div className="profile__section profile__section--top">
        <div className="container container--left-padding-compensation">
          <div className="row">
            <div className="col-sm-2">
              <img
                src={this.props.user.picture}
                alt=""
                className="rounded-circle profile__avatar"
              ></img>
            </div>
            <div className="col-sm-10">
              <a
                href="#"
                className="profile__edit-icon profile__edit-icon--right-padding-compensation"
                onClick={this.handleClick}
              >
                <i className="fas fa-pen"></i>
              </a>
              <div>
                <h1 className="section__name mb-3">
                  {this.props.user.firstName} {this.props.user.lastName}
                </h1>
                <h2 className="section__subheading">{this.props.header}</h2>
                <h3 className="section__subheading">{this.props.location}</h3>
                <span className="status-tag">
                  <h2 className="status-tag__content">{this.props.status}</h2>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GeneralInformationSection;
