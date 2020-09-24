import React from "react";
import classNames from "classnames";

function InputInputGroup({
  htmlFor,
  label,
  icon,
  name,
  type,
  error,
  id,
  value,
  placeholder,
  onChange,
  info,
}) {
  return (
    <div className="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text input-group-text--fixed-width">
          <i className={icon} />
        </span>
      </div>
      {label && <label htmlFor={htmlFor}>{label}</label>}
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
      />
      {info && <small className="form-text text-muted">{info}</small>}
      {error && <div className="invalid-feedback">{error.msg}</div>}
    </div>
  );
}

export default InputInputGroup;
