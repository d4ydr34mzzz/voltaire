import React, { Component } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { connect } from "react-redux";
import { registerUser, clearErrors } from "./authSlice.js";
import { withRouter } from "react-router-dom";
import InputFormGroup from "../forms/InputFormGroup";

// TODO: Convert the class component into a function component to use hooks (ex. useDispatch() and useSelector() from react-redux)?
class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      errors: {},
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
  }

  componentWillUnmount() {
    this.props.clearErrors();
  }

  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const newUser = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      password: this.state.password,
      confirmPassword: this.state.confirmPassword,
    };

    this.props.registerUser(newUser).then(() => {
      if (this.props.auth.register_status === "succeeded") {
        this.props.history.push("/login");
      }
    });
  }

  render() {
    const errors = this.props.auth ? this.props.auth.errors : {};
    return (
      <div className="row">
        <div className="col-md-6 mx-auto">
          <div className="card card--login-and-register-modal-adjustment">
            <div className="card-body">
              <h1 className="card-title pb-4">Create an account</h1>
              <form onSubmit={this.handleSubmit}>
                <InputFormGroup
                  htmlFor="firstName"
                  label="First name"
                  name="firstName"
                  type="text"
                  error={errors.firstName}
                  value={this.state.fistName}
                  onChange={this.handleInputChange}
                />
                <InputFormGroup
                  htmlFor="lastName"
                  label="Last name"
                  name="lastName"
                  type="text"
                  error={errors.lastName}
                  value={this.state.lastName}
                  onChange={this.handleInputChange}
                />
                <InputFormGroup
                  htmlFor="email"
                  label="Email address"
                  name="email"
                  type="email"
                  error={errors.email}
                  value={this.state.email}
                  onChange={this.handleInputChange}
                />
                <InputFormGroup
                  htmlFor="password"
                  label="Password"
                  name="password"
                  type="password"
                  error={errors.password}
                  value={this.state.password}
                  onChange={this.handleInputChange}
                />
                <InputFormGroup
                  htmlFor="confirmPassword"
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  error={errors.confirmPassword}
                  value={this.state.confirmPassword}
                  onChange={this.handleInputChange}
                />
                <button
                  type="submit"
                  className="btn btn-primary float-right mt-3 mb-3"
                >
                  Sign up with email
                </button>
              </form>
              <div className="clear">
                <div className="row">
                  <div className="col">
                    <hr></hr>
                  </div>
                  <div className="col-auto">Or</div>
                  <div className="col">
                    <hr></hr>
                  </div>
                </div>

                <Link to="" className="btn btn-secondary btn-block mt-3 mb-3">
                  <i className="fab fa-google mr-2"></i> Sign up with Google
                </Link>

                <h2 className="sign-up-prompt pt-2">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="a--default-style-removed text-decoraction-none"
                  >
                    Sign in
                  </Link>
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Select data from store that the Register component needs; each field with become a prop in the Register component
const mapStateToProps = (state) => ({
  auth: state.auth,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the Register component
 */
const mapDispatchToProps = {
  registerUser,
  clearErrors,
};

// Connect the Register component to the Redux store
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Register));
