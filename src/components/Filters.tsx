import * as React from "react";

export type Filter = {
  label: string;
  value: string;
  items: {
    label: string;
    value: string;
  }[];
};

const Filters: React.FunctionComponent<{
  data: Filter[];
  onFilterItemSelected: (item: string) => void;
}> = props => (
  <>
    {props.data.map(filter => (
      <div key={filter.value}>
        {filter.label}
        <ul>
          {filter.items.map(item => (
            <li
              key={item.value}
              onClick={() => props.onFilterItemSelected(item.value)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </>
);

export default Filters;
