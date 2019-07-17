import * as React from "react";

const Filter: React.FunctionComponent<{
  labels: string[];
  onFilterSelected: (label: string) => void;
}> = props => (
  <ul>
    {props.labels.map(label => (
      <li key={label} onClick={() => props.onFilterSelected(label)}>
        {label}
      </li>
    ))}
  </ul>
);

export default Filter;
