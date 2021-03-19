import React, { Component } from "react";
import { withRouter } from "react-router";
import algoliasearch from "algoliasearch/lite";
import { InstantSearch, Configure } from "react-instantsearch-dom";
import { algoliaIndexName } from "../../config/algolia.js";
import {
  createURL,
  createURLWithoutConfigure,
  urlToSearchState,
} from "../../helpers/algolia.js";
import Autocomplete from "./Autocomplete.js";

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APPLICATION_ID,
  process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY
);

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchState: urlToSearchState(this.props.location),
    };

    this.onSearchStateChange = this.onSearchStateChange.bind(this);
    this.onSearchEntered = this.onSearchEntered.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.setState({ searchState: urlToSearchState(this.props.location) });
    }
  }

  onSearchStateChange(searchState) {
    this.setState({ searchState });
  }

  onSearchEntered() {
    this.props.history.push(
      "/explore" + createURLWithoutConfigure(this.state.searchState)
    );
  }

  render() {
    return (
      <InstantSearch
        indexName={algoliaIndexName}
        searchClient={searchClient}
        searchState={this.state.searchState}
        createURL={createURL}
        onSearchStateChange={this.onSearchStateChange}
      >
        <Configure hitsPerPage={10} />
        <Autocomplete
          currentQuery={this.state.searchState.query}
          onSearchBarFocusChange={this.props.onSearchBarFocusChange}
          onSearchEntered={this.onSearchEntered}
        />
      </InstantSearch>
    );
  }
}

export default withRouter(SearchBar);
