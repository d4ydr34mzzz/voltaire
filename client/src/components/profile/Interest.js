import React, { Component } from "react";
import { Draggable } from "react-beautiful-dnd";

class Interest extends Component {
  constructor(props) {
    super(props);
    this.removeInterest = this.removeInterest.bind(this);
  }

  removeInterest(event) {
    if (event.target && event.target.matches("i.fa-minus-circle")) {
      this.props.onRemoveInterest(this.props.index);
    }
  }

  render() {
    return (
      <Draggable draggableId={this.props.interest.id} index={this.props.index}>
        {(provided, snapshot) => {
          return (
            <li
              ref={provided.innerRef}
              {...provided.draggableProps}
              className="list-group-item"
              onClick={this.removeInterest}
            >
              {this.props.interest.content}
              <div className="float-right">
                <span role="button" className="mr-4">
                  <i className="fas fa-minus-circle"></i>
                </span>

                <span {...provided.dragHandleProps} role="button">
                  <i className="fas fa-bars"></i>
                </span>
              </div>
            </li>
          );
        }}
      </Draggable>
    );
  }
}

export default Interest;
