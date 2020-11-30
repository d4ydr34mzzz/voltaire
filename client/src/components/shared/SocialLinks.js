import React from "react";
import classNames from "classnames";
import shortid from "shortid";

function SocialLinks(props) {
  return Object.keys(props.links).map((key) => {
    switch (key) {
      case "youtube":
        return (
          <li className="d-inline-block mr-3" key={shortid.generate()}>
            <a
              rel="external"
              target="_blank"
              href={props.links[key]}
              className={classNames("section__connect-icon", {
                [`fs-${props.alternativeFontSize}`]: props.alternativeFontSize,
              })}
            >
              <i className="fab fa-youtube"></i>
            </a>
          </li>
        );
      case "twitter":
        return (
          <li className="d-inline-block mr-3" key={shortid.generate()}>
            <a
              rel="external"
              target="_blank"
              href={props.links[key]}
              className={classNames("section__connect-icon", {
                [`fs-${props.alternativeFontSize}`]: props.alternativeFontSize,
              })}
            >
              <i className="fab fa-twitter"></i>
            </a>
          </li>
        );
      case "facebook":
        return (
          <li className="d-inline-block mr-3" key={shortid.generate()}>
            <a
              rel="external"
              target="_blank"
              href={props.links[key]}
              className={classNames("section__connect-icon", {
                [`fs-${props.alternativeFontSize}`]: props.alternativeFontSize,
              })}
            >
              <i className="fab fa-facebook"></i>
            </a>
          </li>
        );
      case "linkedin":
        return (
          <li className="d-inline-block mr-3" key={shortid.generate()}>
            <a
              rel="external"
              target="_blank"
              href={props.links[key]}
              className={classNames("section__connect-icon", {
                [`fs-${props.alternativeFontSize}`]: props.alternativeFontSize,
              })}
            >
              <i className="fab fa-linkedin"></i>
            </a>
          </li>
        );
      case "instagram":
        return (
          <li className="d-inline-block mr-3" key={shortid.generate()}>
            <a
              rel="external"
              target="_blank"
              href={props.links[key]}
              className={classNames("section__connect-icon", {
                [`fs-${props.alternativeFontSize}`]: props.alternativeFontSize,
              })}
            >
              <i className="fab fa-instagram-square"></i>
            </a>
          </li>
        );
    }
  });
}

export default SocialLinks;
