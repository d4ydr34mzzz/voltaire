import React, { Component } from "react";
import { withRouter } from "react-router";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  Hits,
  Configure,
  connectSearchBox,
} from "react-instantsearch-dom";
import { algoliaIndexName } from "../../config/algolia.js";
import {
  createURL,
  createURLWithoutConfigure,
  urlToSearchState,
} from "../../helpers/algolia.js";
import ProfileSummaryCard from "./ProfileSummaryCard.js";
import SearchPagination from "./SearchPagination.js";
import Results from "./Results.js";

const VirtualSearchBox = connectSearchBox(() => null);

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APPLICATION_ID,
  process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY
);

class Explore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchState: urlToSearchState(this.props.location),
    };

    this.onSearchStateChange = this.onSearchStateChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.search !== prevProps.location.search) {
      this.setState({ searchState: urlToSearchState(this.props.location) });
    }
  }

  onSearchStateChange(searchState) {
    this.props.history.push(
      "/explore" + createURLWithoutConfigure(searchState)
    );
  }

  render() {
    return (
      <div className="explore">
        <div className="container-fluid explore__header p-0">
          <div className="container pt-5"></div>
        </div>
        <div className="container-fluid explore__body">
          <div className="container">
            <InstantSearch
              indexName={
                algoliaIndexName +
                (!this.state.searchState.query ? "_name_asc" : "")
              }
              searchClient={searchClient}
              searchState={this.state.searchState}
              createURL={createURL}
              onSearchStateChange={this.onSearchStateChange}
            >
              <Configure hitsPerPage={30} />
              <VirtualSearchBox defaultRefinement={this.state.searchState} />
              <Results>
                <Hits hitComponent={ProfileSummaryCard} />
              </Results>
              <SearchPagination />
            </InstantSearch>
          </div>
        </div>
      </div>
    );
  }
}

// Connect the Explore component to the Redux store
export default withRouter(Explore);
