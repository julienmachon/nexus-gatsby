import * as React from "react";

const Filters: React.FunctionComponent<{
  data: {
    label: string;
    value: string;
    items: {
      label: string;
      value: string;
    }[];
  }[];
  onFilterItemSelected: (item: string) => void;
}> = props =>
  props.data.map(filter => (
    <div key={filter.value}>
      {filter.label}
      <ul>
        {filter.items.map(item => (
          <li
            key={item.value}
            onClick={() => props.onFilterSelected(item.value)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  ));

export default Filters;
