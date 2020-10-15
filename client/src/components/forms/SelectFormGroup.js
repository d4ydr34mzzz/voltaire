import React from "react";
import classNames from "classnames";

function SelectFormGroup({
  htmlFor,
  label,
  name,
  error,
  id,
  value,
  options,
  onChange,
  info,
  required,
}) {
  const selectOptions = options.map((option) => {
    return (
      <option key={option.label} value={option.value}>
        {option.label}
      </option>
    );
  });

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={htmlFor}>
          {label}
          {required ? <span className="required-asterisk"> *</span> : null}
        </label>
      )}
      <select
        name={name}
        className={classNames("form-control", {
          "is-invalid": error,
        })}
        id={id}
        value={value}
        onChange={onChange}
        required={required}
      >
        {selectOptions}
      </select>
      {info && <small className="form-text text-muted">{info}</small>}
      {error && <div className="invalid-feedback">{error.msg}</div>}
    </div>
  );
}

export default SelectFormGroup;
