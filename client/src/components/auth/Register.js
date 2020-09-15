import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import classNames from "classnames";

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

  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value,
    });
  }

  handleSubmit(event) {
    const newUser = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      password: this.state.password,
      confirmPassword: this.state.confirmPassword,
    };

    axios
      .post("/api/users/register", newUser)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        this.setState({ errors: error.response.data });
        console.log(this.state.errors);
      });

    event.preventDefault();
  }

  render() {
    const { errors } = this.state;
    return (
      <div className="row">
        <div className="col-md-6 mx-auto">
          <div className="card card--login-and-register-modal-adjustment">
            <div className="card-body">
              <h1 className="card-title pb-4">Create an account</h1>
              <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label htmlFor="firstName">First name</label>
                  <input
                    name="firstName"
                    type="text"
                    className={classNames("form-control", {
                      "is-invalid": errors.firstName,
                    })}
                    id="firstName"
                    value={this.state.fistName}
                    onChange={this.handleInputChange}
                  />
                  {errors.firstName && (
                    <div class="invalid-feedback">{errors.firstName.msg}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    name="lastName"
                    type="text"
                    className={classNames("form-control", {
                      "is-invalid": errors.lastName,
                    })}
                    id="lastName"
                    value={this.state.lastName}
                    onChange={this.handleInputChange}
                  />
                  {errors.lastName && (
                    <div class="invalid-feedback">{errors.lastName.msg}</div>
                  )}
                </div>
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
                    <div class="invalid-feedback">{errors.email.msg}</div>
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
                    <div class="invalid-feedback">{errors.password.msg}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    className={classNames("form-control", {
                      "is-invalid": errors.confirmPassword,
                    })}
                    id="confirmPassword"
                    value={this.state.confirmPassword}
                    onChange={this.handleInputChange}
                  />
                  {errors.confirmPassword && (
                    <div class="invalid-feedback">
                      {errors.confirmPassword.msg}
                    </div>
                  )}
                </div>
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

export default Register;
