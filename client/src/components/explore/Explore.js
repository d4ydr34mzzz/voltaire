import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchProfiles } from "../profile/profileSlice.js";
import LoadingIcon from "../shared/LoadingIcon.js";
import ProfileSummaryCard from "./ProfileSummaryCard.js";
import ReactPaginate from "react-paginate";

class Explore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      limit: 30,
      pageCount: null,
    };

    this.handlePageClick = this.handlePageClick.bind(this);
  }

  componentDidMount() {
    const paginationData = {
      page: 1,
      limit: this.state.limit,
    };
    this.props.fetchProfiles(paginationData).then(() => {
      this.setState({
        pageCount:
          this.props.profile &&
          this.props.profile.profiles &&
          this.props.profile.profiles.totalPages,
      });
    });
  }

  handlePageClick(event) {
    const paginationData = {
      page: event.selected + 1,
      limit: this.state.limit,
    };
    this.props.fetchProfiles(paginationData).then(() => {
      this.setState({
        pageCount:
          this.props.profile &&
          this.props.profile.profiles &&
          this.props.profile.profiles.totalPages,
      });
    });
  }

  render() {
    const { profiles } = this.props.profile;

    let exceptions;
    let exploreContent;

    if (!profiles || this.props.profile.fetch_profiles_status === "loading") {
      exploreContent = <LoadingIcon />;
    } else if (this.props.profile.fetch_profiles_status === "failed") {
      exceptions = (
        <div class="alert alert-secondary" role="alert">
          {(() => {
            if (
              this.props.profile &&
              this.props.profile.fetch_profiles_errors &&
              this.props.profile.fetch_profiles_errors.pagination
            ) {
              return this.props.profile.fetch_profiles_errors.pagination.msg;
            } else {
              return "There was an issue processing the request. Please try again later.";
            }
          })()}
        </div>
      );
    } else {
      exploreContent = profiles.response.map((profile) => (
        <ProfileSummaryCard key={profile._id} profile={profile} />
      ));
    }

    return (
      <div className="explore">
        <div className="container-fluid explore__header p-0">
          <div className="container pt-5">{exceptions}</div>
        </div>
        <div className="container-fluid explore__body">
          <div className="container">
            {exploreContent}
            <div className="react-paginate">
              <ReactPaginate
                pageCount={this.state.pageCount}
                pageRangeDisplayed={7}
                marginPagesDisplayed={1}
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                breakClassName={"page-item"}
                breakLinkClassName={"page-link"}
                onPageChange={this.handlePageClick}
                containerClassName={"pagination justify-content-center"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                activeClassName={"active"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Select data from store that the Explore component needs; each field with become a prop in the Explore component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the Explore component
 */
const mapDispatchToProps = {
  fetchProfiles,
};

// Connect the Explore component to the Redux store
export default connect(mapStateToProps, mapDispatchToProps)(Explore);
