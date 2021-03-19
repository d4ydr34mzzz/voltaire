import React, { Component } from "react";
import { connectStateResults } from "react-instantsearch-dom";
import LoadingIcon from "../shared/LoadingIcon.js";

class Results extends Component {
  constructor(props) {
    super(props);
  }

  /* References:
   * https://www.algolia.com/doc/guides/building-search-ui/going-further/conditional-display/react/
   * https://www.algolia.com/doc/api-reference/widgets/state-results/react/#connector
   * https://github.com/algolia/react-instantsearch/issues/137
   */
  render() {
    return (
      <div className="search-results">
        <div
          class="search-results__error-message"
          hidden={this.props.searching || this.props.error === null}
        >
          There was an issue processing the request. Please try again later.
        </div>

        <div
          className="search-results__no-results-found-message"
          hidden={
            this.props.searching ||
            this.props.error !== null ||
            (this.props.searchResults && this.props.searchResults.nbHits !== 0)
          }
        >
          <p>No results found for "{this.props.searchState.query}"</p>
        </div>

        <div hidden={!this.props.searching}>
          <LoadingIcon />
        </div>

        <div hidden={this.props.searching || this.props.error}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default connectStateResults(Results);
