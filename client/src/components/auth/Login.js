import React, { Component } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { connect } from "react-redux";
import { loginUser, clearErrors } from "./authSlice.js";
import { withRouter } from "react-router-dom";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      errors: {},
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

    const userData = {
      email: this.state.email,
      password: this.state.password,
    };

    this.props.loginUser(userData).then(() => {
      if (this.props.auth.login_status === "succeeded") {
        this.props.history.push("/dashboard");
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
              <h1 className="card-title pb-4">Sign in</h1>
              <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email address</label>
                  <input
                    name="email"
                    type="email"
                    className={classNames("form-control", {
                      "is-invalid": errors.email,
                    })}
                    id="email"
                    value={this.state.email}
                    onChange={this.handleInputChange}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email.msg}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    name="password"
                    type="password"
                    className={classNames("form-control", {
                      "is-invalid": errors.password,
                    })}
                    id="password"
                    value={this.state.password}
                    onChange={this.handleInputChange}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password.msg}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary float-right mt-3 mb-3"
                >
                  Sign in
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
                  <i className="fab fa-google mr-2"></i> Continue with Google
                </Link>

                <h2 className="sign-up-prompt pt-2">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="a--default-style-removed text-decoraction-none"
                  >
                    Sign up
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

// Select data from store that the Login component needs; each field with become a prop in the Login component
const mapStateToProps = (state) => ({
  auth: state.auth,
});

/*
 * Create functions that dispatch when called; object shorthand form automatically calls bindActionCreators
 * internally; these functions are passed as props to the Login component
 */
const mapDispatchToProps = {
  loginUser,
  clearErrors,
};

// Connect the Login component to the Redux store
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Login));
