import React, { Component } from "react";
import shortid from "shortid";

class SocialLinksSection extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    this.props.onModalAlteration("links");
  }

  render() {
    return (
      <div className="profile__section profile__section--connect mb-4">
        <a href="#" className="profile__edit-icon" onClick={this.handleClick}>
          <i className="fas fa-pen"></i>
        </a>
        <ul className="mt-3 pt-4 pb-4 pl-0 pr-0">
          {Object.keys(this.props.links).map((key) => {
            switch (key) {
              case "youtube":
                return (
                  <li className="d-inline-block mr-3" key={shortid.generate()}>
                    <a
                      rel="external"
                      target="_blank"
                      href={this.props.links[key]}
                      className="section__connect-icon"
                    >
                      <i class="fab fa-youtube"></i>
                    </a>
                  </li>
                );
              case "twitter":
                return (
                  <li className="d-inline-block mr-3" key={shortid.generate()}>
                    <a
                      rel="external"
                      target="_blank"
                      href={this.props.links[key]}
                      className="section__connect-icon"
                    >
                      <i class="fab fa-twitter"></i>
                    </a>
                  </li>
                );
              case "facebook":
                return (
                  <li className="d-inline-block mr-3" key={shortid.generate()}>
                    <a
                      rel="external"
                      target="_blank"
                      href={this.props.links[key]}
                      className="section__connect-icon"
                    >
                      <i class="fab fa-facebook"></i>
                    </a>
                  </li>
                );
              case "linkedin":
                return (
                  <li className="d-inline-block mr-3" key={shortid.generate()}>
                    <a
                      rel="external"
                      target="_blank"
                      href={this.props.links[key]}
                      className="section__connect-icon"
                    >
                      <i class="fab fa-linkedin"></i>
                    </a>
                  </li>
                );
              case "instagram":
                return (
                  <li className="d-inline-block mr-3" key={shortid.generate()}>
                    <a
                      rel="external"
                      target="_blank"
                      href={this.props.links[key]}
                      className="section__connect-icon"
                    >
                      <i class="fab fa-instagram-square"></i>
                    </a>
                  </li>
                );
            }
          })}
        </ul>
      </div>
    );
  }
}

export default SocialLinksSection;
