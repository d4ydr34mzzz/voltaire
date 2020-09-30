import React, { Component } from "react";
import { Draggable } from "react-beautiful-dnd";

class Skill extends Component {
  constructor(props) {
    super(props);

    this.removeSkill = this.removeSkill.bind(this);
  }

  removeSkill(event) {
    if (event.target && event.target.matches("i.fa-minus-circle")) {
      this.props.onRemoveSkill(this.props.index);
    }
  }

  render() {
    return (
      <Draggable draggableId={this.props.skill.id} index={this.props.index}>
        {(provided, snapshot) => (
          <li
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="list-group-item"
            onClick={this.removeSkill}
          >
            {this.props.skill.content}
            <div className="float-right">
              <span role="button" className="mr-4">
                <i className="fas fa-minus-circle"></i>
              </span>

              <span {...provided.dragHandleProps} role="button">
                <i className="fas fa-bars"></i>
              </span>
            </div>
          </li>
        )}
      </Draggable>
    );
  }
}

export default Skill;
