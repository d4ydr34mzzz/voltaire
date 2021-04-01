import React, { Component } from "react";
import axios from "axios";
import {
  RepoIcon,
  RepoForkedIcon,
  StarIcon,
  EyeIcon,
  LinkExternalIcon,
} from "@primer/octicons-react";
import { ReactComponent as EmptySetIcon } from "../../images/svg/emptyset.svg";
import Skeleton from "react-loading-skeleton";

class GitHubSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repos: [],
      loading: true,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    axios
      .get(`/api/github/user/${this.props.username}/repos`)
      .then((response) => {
        this.setState({ repos: response.data, loading: false });
      })
      .catch((err) => {
        this.setState({ loading: false });
      });
  }

  componentDidUpdate(prevProps) {
    if (this.props.username !== prevProps.username) {
      this.setState({ loading: true });
      axios
        .get(`/api/github/user/${this.props.username}/repos`)
        .then((response) => {
          this.setState({ repos: response.data, loading: false });
        })
        .catch((err) => {
          this.setState({ loading: false });
        });
    }
  }

  handleClick(event) {
    event.preventDefault();
    this.props.onModalAlteration("github");
  }

  render() {
    return (
      <div>
        {this.state.loading ? (
          <Skeleton className="profile__section mb-4" />
        ) : (
          <div className="profile__section mb-4">
            {this.props.onModalAlteration ? (
              <a
                href="#"
                className="profile__edit-icon"
                onClick={this.handleClick}
              >
                <i className="fas fa-pen"></i>
              </a>
            ) : null}
            <span>
              <h1 className="section__heading">GitHub </h1>
              <a
                href={`https://github.com/${this.props.username}`}
                target="_blank"
                className="section__external-link"
              >
                <LinkExternalIcon
                  size={16}
                  className="section__external-link-icon"
                />
              </a>
            </span>

            {this.state.repos.length !== 0 ? (
              <ul className="list-group list-group-flush clearfix">
                {this.state.repos.map((repo) => {
                  return (
                    <li className="list-group-item pt-4 pl-0" key={repo.id}>
                      <p className="mb-2">
                        {repo.fork ? (
                          <RepoForkedIcon
                            size={16}
                            className="section__repo-icon"
                          />
                        ) : (
                          <RepoIcon size={16} className="section__repo-icon" />
                        )}
                        <a
                          href={repo.html_url}
                          target="_blank"
                          className="section__repo-name"
                        >
                          {repo.name}
                        </a>
                      </p>
                      {repo.description ? (
                        <p className="section__repo-description mb-2">
                          {repo.description}
                        </p>
                      ) : null}
                      <span>
                        <span className="badge badge-primary section__repo-badge">
                          <EyeIcon size={16} className="section__repo-icon" />
                          {repo.watchers}
                        </span>
                        <span className="badge badge-primary section__repo-badge">
                          <StarIcon size={16} className="section__repo-icon" />
                          {repo.stargazers_count}
                        </span>
                        <span className="badge badge-primary section__repo-badge">
                          <RepoForkedIcon
                            size={16}
                            className="section__repo-icon"
                          />
                          {repo.forks_count}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center">
                <EmptySetIcon className="section__empty-set-icon" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default GitHubSection;
