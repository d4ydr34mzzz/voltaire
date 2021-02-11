import React, { Component } from "react";
import { connect } from "react-redux";
import { addSocialLinks, clearAddSocialLinksErrors } from "./profileSlice.js";
import ConfirmDiscardChangesModal from "./ConfirmDiscardChangesModal.js";
import InputInputGroup from "../forms/InputInputGroup.js";

class AddSocialLinksModal extends Component {
  constructor(props) {
    super(props);
    if (this.props.profile && this.props.profile.profile.social) {
      this.state = {
        youtube: this.props.profile.profile.social.youtube || "",
        twitter: this.props.profile.profile.social.twitter || "",
        facebook: this.props.profile.profile.social.facebook || "",
        linkedin: this.props.profile.profile.social.linkedin || "",
        instagram: this.props.profile.profile.social.instagram || "",
        changesMade: false,
        discardChangesModalActive: false,
      };
    } else {
      this.state = {
        youtube: "",
        twitter: "",
        facebook: "",
        linkedin: "",
        instagram: "",
        changesMade: false,
        discardChangesModalActive: false,
      };
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClearSocialButtonClick = this.handleClearSocialButtonClick.bind(
      this
    );
    this.cancelAddSocialLinks = this.cancelAddSocialLinks.bind(this);
    this.handleDiscardChangesConfirmation = this.handleDiscardChangesConfirmation.bind(
      this
    );
    this.handleDiscardChangesCancellation = this.handleDiscardChangesCancellation.bind(
      this
    );
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearAddSocialLinksErrors();
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

  handleClearSocialButtonClick(event) {
    const name = event.currentTarget.dataset.socialid;

    this.setState({
      [name]: "",
      changesMade: true,
    });
  }

  cancelAddSocialLinks(event) {
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

  handleSubmit(event) {
    event.preventDefault();

    const socialData = {
      youtube: this.state.youtube,
      twitter: this.state.twitter,
      facebook: this.state.facebook,
      linkedin: this.state.linkedin,
      instagram: this.state.instagram,
    };

    this.props.addSocialLinks(socialData).then(() => {
      if (this.props.profile.add_social_links_status === "succeeded") {
        this.props.onModalAlteration("");
      }
    });
  }

  render() {
    let errors = this.props.profile.add_social_links_errors
      ? this.props.profile.add_social_links_errors
      : {};

    return (
      <div>
        <div className="modal-overlay" onMouseDown={this.cancelAddSocialLinks}>
          <div
            className="modal__content card"
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="card-header">
              Social links
              <a
                href="#"
                className="modal__exit-icon"
                onClick={this.cancelAddSocialLinks}
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
              <form onSubmit={this.handleSubmit} noValidate>
                <InputInputGroup
                  htmlFor="youtube"
                  icon="fab fa-youtube"
                  name="youtube"
                  type="url"
                  error={errors.youtube}
                  id="youtube"
                  value={this.state.youtube}
                  placeholder="YouTube"
                  onChange={this.handleInputChange}
                  button={<i class="fas fa-eraser"></i>}
                  onButtonClick={this.handleClearSocialButtonClick}
                  buttonDataAttributes={{ "data-socialid": "youtube" }}
                />

                <InputInputGroup
                  htmlFor="twitter"
                  icon="fab fa-twitter"
                  name="twitter"
                  type="url"
                  error={errors.twitter}
                  id="twitter"
                  value={this.state.twitter}
                  placeholder="Twitter"
                  onChange={this.handleInputChange}
                  button={<i class="fas fa-eraser"></i>}
                  onButtonClick={this.handleClearSocialButtonClick}
                  buttonDataAttributes={{ "data-socialid": "twitter" }}
                />

                <InputInputGroup
                  htmlFor="facebook"
                  icon="fab fa-facebook"
                  name="facebook"
                  type="url"
                  error={errors.facebook}
                  id="facebook"
                  value={this.state.facebook}
                  placeholder="Facebook"
                  onChange={this.handleInputChange}
                  button={<i class="fas fa-eraser"></i>}
                  onButtonClick={this.handleClearSocialButtonClick}
                  buttonDataAttributes={{ "data-socialid": "facebook" }}
                />

                <InputInputGroup
                  htmlFor="linkedin"
                  icon="fab fa-linkedin"
                  name="linkedin"
                  type="url"
                  error={errors.linkedin}
                  id="linkedin"
                  value={this.state.linkedin}
                  placeholder="LinkedIn"
                  onChange={this.handleInputChange}
                  button={<i class="fas fa-eraser"></i>}
                  onButtonClick={this.handleClearSocialButtonClick}
                  buttonDataAttributes={{ "data-socialid": "linkedin" }}
                />

                <InputInputGroup
                  htmlFor="instagram"
                  icon="fab fa-instagram-square"
                  name="instagram"
                  type="url"
                  error={errors.instagram}
                  id="instagram"
                  value={this.state.instagram}
                  placeholder="Instagram"
                  onChange={this.handleInputChange}
                  button={<i class="fas fa-eraser"></i>}
                  onButtonClick={this.handleClearSocialButtonClick}
                  buttonDataAttributes={{ "data-socialid": "instagram" }}
                />

                <div className="float-right mt-4 mb-4">
                  <button
                    type="button"
                    className="btn btn-secondary mr-4"
                    onClick={this.cancelAddSocialLinks}
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
        {this.state.discardChangesModalActive ? (
          <ConfirmDiscardChangesModal
            onDiscardChangesConfirmation={this.handleDiscardChangesConfirmation}
            onDiscardChangesCancellation={this.handleDiscardChangesCancellation}
          />
        ) : null}
      </div>
    );
  }
}

// Select data from store that the AddSocialLinksModal component needs; each field with become a prop in the AddSocialLinksModal component
const mapStateToProps = (state) => ({
  profile: state.profile,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the AddSocialLinksModal component
 */
const mapDispatchToProps = {
  addSocialLinks,
  clearAddSocialLinksErrors,
};

// Connect the AddSocialLinksModal component to the Redux store
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddSocialLinksModal);
