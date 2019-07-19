import * as React from "react";

const ResourceList: React.FunctionComponent<{
  data: { label: string; value: string }[];
}> = props => {
  return (
    <ul>
      {props.data.map(resource => (
        <li key={resource.value}>{resource.label}</li>
      ))}
    </ul>
  );
};

export default ResourceList;
