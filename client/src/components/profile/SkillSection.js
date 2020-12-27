import React, { Component } from "react";
import shortid from "shortid";

class SkillSection extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    this.props.onModalAlteration("skills");
  }

  render() {
    return (
      <div className="profile__section mb-4">
        {this.props.onModalAlteration ? (
          <a href="#" className="profile__edit-icon" onClick={this.handleClick}>
            <i className="fas fa-pen"></i>
          </a>
        ) : null}
        <h1 className="section__heading">Skills</h1>
        <ul className="list-group list-group-flush mt-3">
          {this.props.skills.map((skill) => {
            return (
              <li
                className="section__skill list-group-item"
                key={shortid.generate()}
              >
                {skill}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default SkillSection;
