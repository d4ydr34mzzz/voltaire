import React, { Component } from "react";

class AddSectionModal extends Component {
  constructor(props) {
    super(props);

    this.setModal = this.setModal.bind(this);
    this.cancelAddSection = this.cancelAddSection.bind(this);
  }

  setModal(modal) {
    this.props.onModalAlteration(modal);
  }

  cancelAddSection(event) {
    this.props.onModalAlteration("");
  }

  render() {
    // Reference: https://stackoverflow.com/questions/58281571/how-to-use-event-target-value-in-li
    const sections = [
      { display: "About", value: "about" },
      { display: "Work experience", value: "experience" },
      { display: "Education", value: "education" },
      { display: "Skills", value: "skills" },
    ];

    const listItems = sections.map((section) => {
      return (
        <a
          href="#"
          className="remove-anchor-style"
          onClick={() => this.setModal(section.value)}
          key={section.value}
        >
          <li className="list-group-item">{section.display}</li>
        </a>
      );
    });

    return (
      <div className="modal-overlay" onClick={this.cancelAddSection}>
        <div
          className="modal__content card"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div class="card-header">
            Add section
            <a
              href="#"
              className="modal__exit-icon"
              onClick={this.cancelAddSection}
            >
              <i className="fas fa-times"></i>
            </a>
          </div>

          <ul class="list-group list-group-flush">{listItems}</ul>
        </div>
      </div>
    );
  }
}

export default AddSectionModal;
