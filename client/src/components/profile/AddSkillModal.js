import React, { Component } from "react";
import { connect } from "react-redux";
import { addSkills, clearAddSkillsErrors } from "./profileSlice.js";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import ConfirmDiscardChangesModal from "./ConfirmDiscardChangesModal.js";
import LoadingIconModal from "./LoadingIconModal.js";
import InputInputGroup from "../forms/InputInputGroup.js";
import Skill from "./Skill.js";
import shortid from "shortid";

class AddSkillModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      skill: "",
      skills: this.getFormattedSkills(),
      changesMade: false,
      discardChangesModalActive: false,
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.cancelAddSkill = this.cancelAddSkill.bind(this);
    this.handleDiscardChangesConfirmation = this.handleDiscardChangesConfirmation.bind(
      this
    );
    this.handleDiscardChangesCancellation = this.handleDiscardChangesCancellation.bind(
      this
    );
    this.handleCloseLoadingIconModal = this.handleCloseLoadingIconModal.bind(
      this
    );
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleRemoveSkill = this.handleRemoveSkill.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearAddSkillsErrors();
  }

  getFormattedSkills() {
    let skills = this.props.profile ? this.props.profile.profile.skills : [];
    skills = skills.map((skill) => ({
      id: shortid.generate(),
      content: skill,
    }));
    return skills;
  }

  /*
   * Important references:
   * https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/types.md
   * https://egghead.io/lessons/react-persist-list-reordering-with-react-beautiful-dnd-using-the-ondragend-callback
   * https://codesandbox.io/s/k260nyxq9v?file=/index.js
   * https://codesandbox.io/examples/package/react-beautiful-dnd
   */
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

    const newSkills = Array.from(this.state.skills);
    const [removed] = newSkills.splice(source.index, 1);
    newSkills.splice(destination.index, 0, removed);

    this.setState({
      skills: newSkills,
      changesMade: true,
    });
  }

  cancelAddSkill(event) {
    event.preventDefault();

    if (this.state.changesMade) {
      this.setState({ discardChangesModalActive: true });
    } else {
      this.props.onModalAlteration("");
    }
  }

  handleDiscardChangesConfirmation() {
    this.props.onModalAlteration("");
  }

  handleDiscardChangesCancellation() {
    this.setState({ discardChangesModalActive: false });
  }

  handleCloseLoadingIconModal() {
    this.props.onModalAlteration("");
  }

  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value,
      changesMade: true,
    });
  }

  handleButtonClick(event) {
    event.preventDefault();
    this.props.clearAddSkillsErrors();
    if (this.state.skill) {
      this.setState((state, props) => ({
        skill: "",
        skills: [
          ...state.skills,
          { id: shortid.generate(), content: state.skill },
        ],
        changesMade: true,
      }));
    }
  }

  handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.props.clearAddSkillsErrors();
      if (this.state.skill) {
        this.setState((state, props) => ({
          skill: "",
          skills: [
            ...state.skills,
            { id: shortid.generate(), content: state.skill },
          ],
          changesMade: true,
        }));
      }
    }
  }

  handleRemoveSkill(index) {
    const newSkills = Array.from(this.state.skills);
    newSkills.splice(index, 1);

    this.setState({
      skills: newSkills,
      changesMade: true,
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const skillData = {
      skills: this.state.skills.map((skill) => skill.content),
    };

    this.props.addSkills(skillData).then(() => {
      if (this.props.profile.add_skills_status === "succeeded") {
        this.props.onModalAlteration("");
      }
    });
  }

  /*
   * Important references regarding the use or arrow functions in render:
   * https://stackoverflow.com/questions/29810914/react-js-onclick-cant-pass-value-to-method
   * https://reactjs.org/docs/faq-functions.html
   * https://medium.com/@sdolidze/react-hooks-memoization-99a9a91c8853
   * https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html
   */
  render() {
    let errors = this.props.profile.add_skills_errors
      ? this.props.profile.add_skills_errors
      : {};

    return (
      <div>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div className="modal-overlay" onMouseDown={this.cancelAddSkill}>
            <div
              className="modal__content card"
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
            >
              <div className="card-header">
                Skills
                <a
                  href="#"
                  className="modal__exit-icon"
                  onClick={this.cancelAddSkill}
                >
                  <i className="fas fa-times"></i>
                </a>
              </div>
              <div className="card-body">
                {errors.error ? (
                  <div class="alert alert-danger" role="alert">
                    {errors.error.msg}
                  </div>
                ) : null}
                {errors.skills ? (
                  <div class="alert alert-danger" role="alert">
                    {errors.skills.msg}
                  </div>
                ) : null}
                <form onSubmit={this.handleSubmit} noValidate>
                  <InputInputGroup
                    htmlFor="skill"
                    name="skill"
                    type="text"
                    id="skill"
                    value={this.state.skill}
                    onChange={this.handleInputChange}
                    button="Add"
                    onButtonClick={this.handleButtonClick}
                    onKeyDown={this.handleKeyDown}
                  />

                  <Droppable droppableId={shortid.generate()}>
                    {(provided, snapshot) => (
                      <ul
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="list-group list-group-flush"
                      >
                        {this.state.skills.map((skill, index) => (
                          <Skill
                            key={skill.id}
                            skill={skill}
                            index={index}
                            onRemoveSkill={this.handleRemoveSkill}
                          />
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>

                  <div className="float-right mt-4 mb-4">
                    <button
                      type="button"
                      className="btn btn-secondary mr-4"
                      onClick={this.cancelAddSkill}
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
        {this.state.discardChangesModalActive ? (
          <ConfirmDiscardChangesModal
            onDiscardChangesConfirmation={this.handleDiscardChangesConfirmation}
            onDiscardChangesCancellation={this.handleDiscardChangesCancellation}
          />
        ) : null}
        {this.props.profile &&
        this.props.profile.add_skills_status === "loading" ? (
          <LoadingIconModal
            onCloseLoadingIconModal={this.handleCloseLoadingIconModal}
          />
        ) : null}
      </div>
    );
  }
}

// Select data from store that the AddSkillModal component needs; each field with become a prop in the AddSkillModal component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the AddSkillModal component
 */
const mapDispatchToProps = {
  addSkills,
  clearAddSkillsErrors,
};

// Connect the AddSkillModal component to the Redux store
export default connect(mapStateToProps, mapDispatchToProps)(AddSkillModal);
