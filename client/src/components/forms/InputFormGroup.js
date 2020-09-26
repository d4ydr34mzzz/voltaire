import React from "react";
import classNames from "classnames";

// TODO: Add static type checking using Flow (https://reactjs.org/docs/static-type-checking.html)
// TODO: Consider Formik (https://formik.org/docs/overview)

// Reference: https://medium.com/@lcriswell/destructuring-props-in-react-b1c295005ce0 (destructuring props in react)
function InputFormGroup({
  htmlFor,
  label,
  name,
  type,
  error,
  id,
  value,
  placeholder,
  onChange,
  info,
  disabled,
}) {
  return (
    <div className="form-group">
      <label htmlFor={htmlFor}>{label}</label>
      <input
        name={name}
        type={type}
        className={classNames("form-control", {
          "is-invalid": error,
        })}
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
      />
      {info && <small className="form-text text-muted">{info}</small>}
      {error && <div className="invalid-feedback">{error.msg}</div>}
    </div>
  );
}

export default InputFormGroup;
