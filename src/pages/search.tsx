import * as React from "react";
import Filter from "../components/Filter";
import ResourceList from "../components/ResourceList";

const fakeData = {
  brainRegion: ["r1", "r2"],
  author: ["julien", "bob"],
};

export default () => {
  const [filter, setFilter] = React.useState();
  return (
    <div>
      <Filter
        labels={["brainRegion", "author"]}
        onFilterSelected={f => setFilter(f)}
      />
      <ResourceList labels={fakeData[filter]} />
    </div>
  );
};
