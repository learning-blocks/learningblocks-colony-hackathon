import React from "react";

export const CourseDropdown = props => {
  const renderSelectOptions = (key, index) => {
    // console.log(key)
    return (
      <option key={index} value={key}>
        {props.options[key]}
      </option>
    );
  };

  if (props && props.options) {
    return (
      <div>
        <div>{props.label}</div>
        <select {...props.input}>
          <option>Select</option>
          {Object.keys(props.options).map(renderSelectOptions)}
        </select>
      </div>
    );
  }
  return <div />;
};

export default CourseDropdown;
