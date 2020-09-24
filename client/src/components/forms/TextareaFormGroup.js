import React from "react";
import classNames from "classnames";

function TextareaFormGroup({
  htmlFor,
  label,
  name,
  rows,
  cols,
  error,
  id,
  value,
  placeholder,
  onChange,
  info,
}) {
  return (
    <div className="form-group">
      <label htmlFor={htmlFor}>{label}</label>
      <textarea
        name={name}
        className={classNames("form-control", {
          "is-invalid": error,
        })}
        id={id}
        value={value}
        placeholder={placeholder}
        rows={rows}
        cols={cols}
        onChange={onChange}
      />
      {info && <small className="form-text text-muted">{info}</small>}
      {error && <div className="invalid-feedback">{error.msg}</div>}
    </div>
  );
}

export default TextareaFormGroup;
