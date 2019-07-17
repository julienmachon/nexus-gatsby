import * as React from "react";

const ResourceList: React.FunctionComponent<{ labels?: string[] }> = props => {
  if (!props.labels) {
    return null;
  }
  return (
    <ul>
      {props.labels.map(label => (
        <li key={label}>{label}</li>
      ))}
    </ul>
  );
};

export default ResourceList;
