import React, { Component } from "react";
import shortid from "shortid";

class InterestsSection extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    this.props.onModalAlteration("interests");
  }

  render() {
    return (
      <div className="profile__section mb-4">
        <a href="#" className="profile__edit-icon" onClick={this.handleClick}>
          <i className="fas fa-pen"></i>
        </a>
        <h1 className="section__heading">Interests</h1>
        <ul className="list-group list-group-flush mt-3">
          {this.props.interests.map((interest) => {
            return (
              <li
                className="section__interests list-group-item"
                key={shortid.generate()}
              >
                {interest}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default InterestsSection;
