import React, { Component } from "react";
import classNames from "classnames";

class ConfirmDeleteEntryModal extends Component {
  constructor(props) {
    super(props);

    this.confirmDeleteEntry = this.confirmDeleteEntry.bind(this);
    this.cancelDeleteEntry = this.cancelDeleteEntry.bind(this);
  }

  confirmDeleteEntry(event) {
    event.preventDefault();
    this.props.onDeleteEntryConfirmation();
  }

  cancelDeleteEntry(event) {
    event.preventDefault();
    this.props.onDeleteEntryCancellation();
  }

  render() {
    return (
      <div className="modal-overlay" onMouseDown={this.cancelDeleteEntry}>
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
            Confirm delete entry
            <a
              href="#"
              className="modal__exit-icon"
              onClick={this.cancelDeleteEntry}
            >
              <i className="fas fa-times"></i>
            </a>
          </div>
          <div className="card-body card-body--overflow-y-auto">
            <p>
              Are you sure you want to delete this entry? This cannot be undone.
            </p>
            <div className="text-right mt-4 mb-4">
              <button
                type="button"
                className="btn btn-secondary mr-4"
                onClick={this.cancelDeleteEntry}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={this.confirmDeleteEntry}
              >
                Delete entry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ConfirmDeleteEntryModal;
