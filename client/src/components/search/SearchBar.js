import React, { Component } from "react";
import algoliasearch from "algoliasearch/lite";
import { InstantSearch, Configure } from "react-instantsearch-dom";
import { algoliaIndexName } from "../../config/algolia.js";
import Autocomplete from "./Autocomplete.js";

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APPLICATION_ID,
  process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY
);

class SearchBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <InstantSearch searchClient={searchClient} indexName={algoliaIndexName}>
        <Configure hitsPerPage={10} />
        <Autocomplete
          onSearchBarFocusChange={this.props.onSearchBarFocusChange}
        />
      </InstantSearch>
    );
  }
}

export default SearchBar;
