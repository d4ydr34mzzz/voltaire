import React, { Component } from "react";
import classNames from "classnames";
import LoadingIcon from "../shared/LoadingIcon.js";

class LoadingIconModal extends Component {
  constructor(props) {
    super(props);

    this.closeLoadingIconModal = this.closeLoadingIconModal.bind(this);
  }

  closeLoadingIconModal(event) {
    event.preventDefault();
    this.props.onCloseLoadingIconModal();
  }

  render() {
    return (
      <div
        className="modal-overlay modal-overlay--light-background"
        onMouseDown={this.closeLoadingIconModal}
      >
        <div
          className={classNames(
            "modal__content modal__content--remove-background-color secondary-modal",
            {
              "secondary-modal--margin-top-150":
                this.props.modalTopMargin === 150,
            }
          )}
        >
          <LoadingIcon />
        </div>
      </div>
    );
  }
}

export default LoadingIconModal;
