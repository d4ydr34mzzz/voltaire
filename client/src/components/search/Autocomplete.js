import React, { Component } from "react";
import { connectAutoComplete } from "react-instantsearch-dom";
import AutoSuggest from "react-autosuggest";
import SearchBarHit from "./SearchBarHit.js";
import { withRouter } from "react-router";

class Autocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.currentQuery ? this.props.currentQuery : "",
      suggestions: [],
    };

    this.textInput = React.createRef();

    this.onChange = this.onChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(
      this
    );
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(
      this
    );
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
  }

  onChange(event, { newValue }) {
    this.setState({ value: newValue });
  }

  onFocus(event) {
    this.props.onSearchBarFocusChange(true);
  }

  onBlur(event, _) {
    this.props.onSearchBarFocusChange(false);
  }

  onKeyPress(event) {
    if (event.key === "Enter") {
      this.props.onSearchEntered();
      this.textInput.current.blur();
    }
  }

  onSuggestionsFetchRequested({ value, reason }) {
    this.props.refine(value);
  }

  onSuggestionsClearRequested() {
    this.props.refine();
  }

  onSuggestionSelected(event, { suggestion }) {
    this.props.history.push(`/profile/${suggestion.handle}`);
    this.textInput.current.blur();
  }

  getSuggestionValue(hit) {
    return hit.name;
  }

  renderSuggestion(hit) {
    return <SearchBarHit hit={hit} />;
  }

  render() {
    const { hits } = this.props;
    const { value } = this.state;

    const inputProps = {
      value,
      onChange: this.onChange,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onKeyPress: this.onKeyPress,
      placeholder: "Search",
      ref: this.textInput,
    };

    return (
      <AutoSuggest
        suggestions={hits}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        inputProps={inputProps}
        onSuggestionSelected={this.onSuggestionSelected}
        focusInputOnSuggestionClick={false}
      />
    );
  }
}

export default connectAutoComplete(withRouter(Autocomplete));
