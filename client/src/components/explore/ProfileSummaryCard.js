import React, { Component } from "react";
import { Link } from "react-router-dom";
import SocialLinks from "../shared/SocialLinks.js";

export default class ProfileSummaryCard extends Component {
  render() {
    const { profile } = this.props;

    return (
      <div className="row user-card">
        <div className="col-12 col-sm-3 text-center">
          <Link
            to={`/profile/${profile.handle}`}
            className="remove-anchor-style"
          >
            <img
              src={
                profile.profilePictureCropped
                  ? profile.profilePictureCropped
                  : profile.user.picture
              }
              className="rounded-circle user-card__profile-picture"
            ></img>
          </Link>
        </div>
        <div className="col-12 col-sm-7 offset-sm-1 offset-md-0 mt-4 mt-sm-0 text-center text-sm-left">
          <Link
            to={`/profile/${profile.handle}`}
            className="remove-anchor-style"
          >
            <h1 className="user-card__name d-inline-block">
              {profile.user.firstName} {profile.user.lastName}
            </h1>
          </Link>
          <h2 className="user-card__location">{profile.location}</h2>
          <h3 className="user-card__header">{profile.header}</h3>
          {profile.social ? (
            <ul className="mt-3 mb-0 pt-2 pb-2 pl-0 pr-0 connect-icon-padding-compensation">
              <SocialLinks
                links={profile.social}
                alternativeFontSize="1_5-rem"
              />
            </ul>
          ) : null}
        </div>
      </div>
    );
  }
}
