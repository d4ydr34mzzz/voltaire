import React, { Component } from "react";
import classNames from "classnames";

class ConfirmDiscardChangesModal extends Component {
  constructor(props) {
    super(props);

    this.confirmDiscardChanges = this.confirmDiscardChanges.bind(this);
    this.cancelDiscardChanges = this.cancelDiscardChanges.bind(this);
  }

  confirmDiscardChanges(event) {
    event.preventDefault();
    this.props.onDiscardChangesConfirmation();
  }

  cancelDiscardChanges(event) {
    event.preventDefault();
    this.props.onDiscardChangesCancellation();
  }

  render() {
    return (
      <div className="modal-overlay" onMouseDown={this.cancelDiscardChanges}>
        <div
          className={classNames("modal__content card secondary-modal", {
            "secondary-modal--margin-top-150":
              this.props.modalTopMargin === 150,
          })}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="card-header">
            Confirm discard changes
            <a
              href="#"
              className="modal__exit-icon"
              onClick={this.cancelDiscardChanges}
            >
              <i className="fas fa-times"></i>
            </a>
          </div>
          <div className="card-body">
            <p>Changes you made have not been saved. Discard changes?</p>
            <div className="float-right mt-4 mb-4">
              <button
                type="button"
                className="btn btn-secondary mr-4"
                onClick={this.cancelDiscardChanges}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={this.confirmDiscardChanges}
              >
                Discard changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ConfirmDiscardChangesModal;
