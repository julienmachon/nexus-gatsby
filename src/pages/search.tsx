import * as React from "react";
import { graphql } from "gatsby";
import Filters, { Filter } from "../components/Filters";
import ResourceList from "../components/ResourceList";

export default ({ data }) => {
  // parse data for filter in order to feed component
  const filters: Filter[] = data.allSearchFilter.nodes.map(filter => {
    return {
      label: filter.label,
      value: filter.value,
      items: filter.childrenSearchFilterItem.map(item => item),
    };
  });

  // do the same for result data
  const resultData = data.allSearchFilter.nodes.reduce((data, filter) => {
    const moreData = filter.childrenSearchFilterItem.reduce(
      (data, item) => ({ ...data, [item.value]: item.childrenSearchResult }),
      {}
    );
    return { ...data, ...moreData };
  }, {});

  const [activeFilter, setActiveFilter] = React.useState();
  return (
    <div>
      <Filters data={filters} onFilterItemSelected={f => setActiveFilter(f)} />
      <ResourceList data={resultData[activeFilter] || []} />
    </div>
  );
};

export const query = graphql`
  query Filters {
    allSearchFilter {
      nodes {
        label
        childSearchFilterItem {
          label
          childrenSearchResult {
            label
            value
          }
          value
        }
        value
      }
    }
  }
`;
