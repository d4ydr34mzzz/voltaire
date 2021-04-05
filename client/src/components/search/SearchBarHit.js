import React, { Component } from "react";

class SearchBarHit extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let hit = this.props.hit;

    return (
      <div>
        <img
          src={
            hit.profilePictureCropped
              ? hit.profilePictureCropped
              : hit.user.picture
          }
          className="ais-Hits__profile-picture mb-3"
          alt=""
        />
        <div className="ai-Hits-item__profile-info d-md-inline-block ml-md-4">
          <h2 className="ais-Hits__name">{hit.name}</h2>
          <span className="ais-Hits__profile-header">{hit.header}</span>
        </div>
      </div>
    );
  }
}

export default SearchBarHit;
