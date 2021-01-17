import React, { Component } from "react";
import parse from "html-react-parser";

class AboutSection extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    this.props.onModalAlteration("about");
  }

  render() {
    return (
      <div className="profile__section mb-4">
        {this.props.onModalAlteration ? (
          <a href="#" className="profile__edit-icon" onClick={this.handleClick}>
            <i className="fas fa-pen"></i>
          </a>
        ) : null}
        <h1 className="section__heading">About me</h1>
        <p className="mt-3">{parse(this.props.bio)}</p>
      </div>
    );
  }
}

export default AboutSection;
