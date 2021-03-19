import React, { Component } from "react";
import { connectPagination } from "react-instantsearch-dom";
import ReactPaginate from "react-paginate";

class SearchPagination extends Component {
  constructor(props) {
    super(props);

    this.handlePageClick = this.handlePageClick.bind(this);
  }

  handlePageClick(event) {
    this.props.refine(event.selected + 1);
  }

  render() {
    return (
      <div className="react-paginate">
        <ReactPaginate
          pageCount={this.props.nbPages}
          pageRangeDisplayed={7}
          marginPagesDisplayed={1}
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          breakClassName={"page-item"}
          breakLinkClassName={"page-link"}
          onPageChange={this.handlePageClick}
          forcePage={this.props.currentRefinement - 1}
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
    );
  }
}

export default connectPagination(SearchPagination);
