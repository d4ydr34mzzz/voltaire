import React, { Component } from "react";
import Moment from "react-moment";
import parse from "html-react-parser";

class ExperienceSection extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    this.props.onModalAlteration("experience");
  }

  handleEditClick(event) {
    event.preventDefault();
    this.props.onModalAlteration(
      "editExperience",
      event.target.dataset.entryid
    );
  }

  render() {
    return (
      <div className="profile__section mb-4">
        {this.props.onModalAlteration ? (
          <a
            href="#"
            className="section__add-entry-icon"
            onClick={this.handleClick}
          >
            <i className="fas fa-plus"></i>
          </a>
        ) : null}
        <h1 className="section__heading">Experience</h1>
        <ul className="list-group list-group-flush">
          {this.props.experience.map((experience) => {
            let from = experience.from ? experience.from.split("T")[0] : "";
            let to = experience.to ? experience.to.split("T")[0] : "";
            return (
              <li className="list-group-item pt-4 pl-0" key={experience._id}>
                <div className="row">
                  <div className="col-sm-11 order-2 order-sm-1">
                    <h2 className="list-group-item__title">
                      {experience.title}
                    </h2>
                    <h2 className="list-group-item__subheading">
                      {experience.company}
                    </h2>
                    <h3 className="list-group-item__subheading">
                      <Moment format="MMM YYYY">{from}</Moment> -{" "}
                      {experience.current ? (
                        "Present"
                      ) : (
                        <Moment format="MMM YYYY">{to}</Moment>
                      )}{" "}
                      <span>&#183; </span>
                      {experience.current ? (
                        <Moment
                          date={experience.from}
                          trim="both"
                          durationFromNow
                          format={() => "y [yrs] M [months]"}
                        />
                      ) : (
                        <Moment
                          duration={experience.from}
                          date={experience.to}
                          trim="both"
                          format="y [yrs] M [months]"
                        />
                      )}
                    </h3>
                    <h3 className="list-group-item__subheading">
                      {experience.location ? experience.location : null}
                    </h3>
                    {experience.description ? (
                      <div className="list-group-item__description">
                        {parse(experience.description)}
                      </div>
                    ) : null}
                  </div>
                  <div className="col-sm-1 pr-0 order-1 order-sm-2">
                    {this.props.onModalAlteration ? (
                      <span
                        role="button"
                        className="edit-entry-icon d-inline-block float-sm-right"
                        onClick={this.handleEditClick}
                      >
                        <i
                          data-entryid={experience._id}
                          className="fas fa-edit"
                        ></i>
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default ExperienceSection;
