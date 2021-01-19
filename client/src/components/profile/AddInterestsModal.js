import React, { Component } from "react";
import { connect } from "react-redux";
import { addInterests, clearAddInterestsErrors } from "./profileSlice.js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import InputInputGroup from "../forms/InputInputGroup.js";
import Interest from "./Interest.js";
import shortid from "shortid";

class AddInterestsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interest: "",
      interests: this.getFormattedInterests(),
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.cancelAddInterests = this.cancelAddInterests.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleRemoveInterest = this.handleRemoveInterest.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearAddInterestsErrors();
  }

  getFormattedInterests() {
    let interests = this.props.profile
      ? this.props.profile.profile.interests
      : [];
    interests = interests.map((interest) => ({
      id: shortid.generate(),
      content: interest,
    }));
    return interests;
  }

  onDragEnd(result) {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newInterests = Array.from(this.state.interests);
    const [removed] = newInterests.splice(source.index, 1);
    newInterests.splice(destination.index, 0, removed);

    this.setState({
      interests: newInterests,
    });
  }

  cancelAddInterests(event) {
    event.preventDefault();
    this.props.onModalAlteration("");
  }

  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value,
    });
  }

  handleButtonClick(event) {
    event.preventDefault();
    this.props.clearAddInterestsErrors();
    if (this.state.interest) {
      this.setState((state, props) => ({
        interest: "",
        interests: [
          ...state.interests,
          { id: shortid.generate(), content: state.interest },
        ],
      }));
    }
  }

  handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.props.clearAddInterestsErrors();
      if (this.state.interest) {
        this.setState((state, props) => ({
          interest: "",
          interests: [
            ...state.interests,
            { id: shortid.generate(), content: state.interest },
          ],
        }));
      }
    }
  }

  handleRemoveInterest(index) {
    const newInterests = Array.from(this.state.interests);
    newInterests.splice(index, 1);

    this.setState({
      interests: newInterests,
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const interestsData = {
      interests: this.state.interests.map((interest) => interest.content),
    };

    this.props.addInterests(interestsData).then(() => {
      if (this.props.profile.add_interests_status === "succeeded") {
        this.props.onModalAlteration("");
      }
    });
  }

  render() {
    let errors = this.props.profile.add_interests_errors
      ? this.props.profile.add_interests_errors
      : {};

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <div className="modal-overlay" onClick={this.cancelAddInterests}>
          <div
            className="modal__content card"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="card-header">
              Interests
              <a
                href="#"
                className="modal__exit-icon"
                onClick={this.cancelAddInterests}
              >
                <i className="fas fa-times"></i>
              </a>
            </div>
            <div className="card-body">
              {errors.interests ? (
                <div class="alert alert-danger" role="alert">
                  {errors.interests.msg}
                </div>
              ) : null}
              <form onSubmit={this.handleSubmit} noValidate>
                <InputInputGroup
                  htmlFor="interest"
                  name="interest"
                  type="text"
                  id="interest"
                  value={this.state.interest}
                  onChange={this.handleInputChange}
                  button="Add"
                  onButtonClick={this.handleButtonClick}
                  onKeyDown={this.handleKeyDown}
                />

                <Droppable droppableId={shortid.generate()}>
                  {(provided, snapshot) => {
                    return (
                      <ul
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="list-group list-group-flush"
                      >
                        {this.state.interests.map((interest, index) => {
                          return (
                            <Interest
                              key={index.id}
                              interest={interest}
                              index={index}
                              onRemoveInterest={this.handleRemoveInterest}
                            />
                          );
                        })}
                        {provided.placeholder}
                      </ul>
                    );
                  }}
                </Droppable>

                <div className="float-right mt-4 mb-4">
                  <button
                    type="button"
                    className="btn btn-secondary mr-4"
                    onClick={this.cancelAddGitHubUsername}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DragDropContext>
    );
  }
}

// Select data from store that the AddInterestsModal component needs; each field with become a prop in the AddInterestsModal component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the AddInterestsModal component
 */
const mapDispatchToProps = {
  addInterests,
  clearAddInterestsErrors,
};

// Connect the AddInterestsModal component to the Redux store
export default connect(mapStateToProps, mapDispatchToProps)(AddInterestsModal);
