import React, { Component } from "react";
import Moment from "react-moment";
import parse from "html-react-parser";

class EducationSection extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    this.props.onModalAlteration("education");
  }

  handleEditClick(event) {
    event.preventDefault();
    this.props.onModalAlteration("editEducation", event.target.dataset.entryid);
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
        <h1 className="section__heading">Education</h1>
        <ul className="list-group list-group-flush">
          {this.props.education.map((education) => {
            let from = education.from ? education.from.split("T")[0] : "";
            let to = education.to ? education.to.split("T")[0] : "";
            return (
              <li className="list-group-item pt-4 pl-0" key={education._id}>
                <div className="row">
                  <div className="col-sm-11 order-2 order-sm 1">
                    <h2 className="list-group-item__title">
                      {education.school}
                    </h2>
                    <h2 className="list-group-item__subheading">
                      {education.degree}, {education.fieldOfStudy}
                    </h2>
                    <h3 className="list-group-item__subheading">
                      <Moment format="MMM YYYY">{from}</Moment> -{" "}
                      {education.current ? (
                        "Present"
                      ) : (
                        <Moment format="MMM YYYY">{to}</Moment>
                      )}
                    </h3>
                    {education.location ? (
                      <h3 className="list-group-item__subheading">
                        {education.location}
                      </h3>
                    ) : null}
                    {education.description ? (
                      <div className="list-group-item__description">
                        {parse(education.description)}
                      </div>
                    ) : null}
                    {education.activities ? (
                      <div className="list-group-item__description">
                        <h3 className="list-group-item__subheading">
                          Clubs and activities:
                        </h3>
                        {parse(education.activities)}
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
                          data-entryid={education._id}
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

export default EducationSection;
