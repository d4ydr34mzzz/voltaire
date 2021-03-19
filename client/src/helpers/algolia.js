import qs from "qs";

export const createURL = (searchState) => {
  return `?${qs.stringify(searchState)}`;
};

export const createURLWithoutConfigure = (searchState) => {
  const { configure, ...newSearchState } = searchState;
  newSearchState.query = newSearchState.query ? newSearchState.query : "";
  return `?${qs.stringify(newSearchState)}`;
};

export const urlToSearchState = (location) => {
  let searchState = qs.parse(location.search.slice(1));
  searchState.query = searchState.query ? searchState.query : "";
  return searchState;
};
