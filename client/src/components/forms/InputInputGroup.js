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
  button,
  onButtonClick,
  buttonDataAttributes,
  onKeyDown,
}) {
  return (
    <div className="input-group mb-3">
      {icon && (
        <div className="input-group-prepend">
          <span className="input-group-text input-group-text--fixed-width">
            <i className={icon} />
          </span>
        </div>
      )}
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
        onKeyDown={onKeyDown}
      />
      {button && (
        <div className="input-group-append">
          <button
            className="btn btn-outline-secondary btn-outline-secondary--match-input-group-border-color"
            type="button"
            {...buttonDataAttributes}
            onClick={onButtonClick}
          >
            {button}
          </button>
        </div>
      )}
      {info && <small className="form-text text-muted">{info}</small>}
      {error && <div className="invalid-feedback">{error.msg}</div>}
    </div>
  );
}

export default InputInputGroup;
