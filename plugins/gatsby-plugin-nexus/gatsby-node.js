const { createNexusClient } = require("@bbp/nexus-sdk");
const fetch = require("node-fetch");
require("abort-controller/polyfill");

const brainLocationQuery = `
prefix neuro: <https://neuroshapes.org/>
prefix w3: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?label (?brainregion as ?value)  WHERE {
  ?id neuro:brainLocation ?brainlocation .
  ?brainlocation rdf:type neuro:BrainLocation .
  ?brainlocation neuro:brainRegion ?brainregion .
  ?brainregion w3:label ?label
}
`;

const getBrainLocationDataQuery = locationId => {
  return `
  prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/>
  prefix neuro: <https://neuroshapes.org/>
  prefix w3: <http://www.w3.org/2000/01/rdf-schema#>
  
  SELECT DISTINCT (?id as ?label) (?self as ?value) WHERE {
    ?id neuro:brainLocation ?brainlocation .
    ?brainlocation rdf:type neuro:BrainLocation .
    ?brainlocation neuro:brainRegion <${locationId}> .
    ?id nxv:self ?self
  }
  `;
};

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest
}) => {
  const { createNode } = actions;

  const nexus = createNexusClient({
    uri: "http://staging.nexus.ocp.bbp.epfl.ch/v1",
    token: process.env.NEXUS_TOKEN,
    fetch
  });

  // let's get all different brain locations 🤯
  const filters = await nexus.View.sparqlQuery(
    "julien",
    "gatsby-portal",
    "nxv:sparqlGatsby",
    brainLocationQuery
  ).then(data =>
    data.results.bindings.map(filter => ({
      label: filter.label.value,
      value: filter.value.value
    }))
  );
  const brainLocationFilters = {
    label: "Brain location",
    value: "brainLocation",
    list: filters
  };
  // for each filters (brain locations), get matching data
  // wait for all promises to resolve
  const brainLocationsData = await Promise.all(
    brainLocationFilters.list.map(async filter => {
      const filterData = await nexus.View.sparqlQuery(
        "julien",
        "gatsby-portal",
        "nxv:sparqlGatsby",
        getBrainLocationDataQuery(filter.value)
      ).then(data =>
        data.results.bindings.map(resource => ({
          label: resource.label.value,
          value: resource.value.value
        }))
      );
      return {
        [filter.value]: filterData
      };
    })
  ).then(data => {
    // merge array of responses into one big object
    return data.reduce((finalData, stuff) => {
      return {
        ...finalData,
        ...stuff
      };
    }, {});
  });

  // time to create our nodes
  [brainLocationFilters].forEach((filter, index) => {
    const filterId = `nexus-filter-${filter.value}`;

    const itemIds = filter.list.map(item => {
      const itemId = `nexus-filter-item-${item.value}`;
      const listIDs = brainLocationsData[item.value].map(resource => {
        const resourceId = `nexus-resource-${resource.label}`;
        createNode({
          id: resourceId,
          parent: itemId,
          children: [],
          internal: {
            type: "SearchResult",
            content: JSON.stringify(resource),
            contentDigest: createContentDigest(resource)
          },
          ...resource
        });
        return resourceId;
      });
      createNode({
        id: itemId,
        parent: filterId,
        children: listIDs,
        internal: {
          type: "SearchFilterItem",
          content: JSON.stringify(filter),
          contentDigest: createContentDigest(filter)
        },
        ...item
      });
      return itemId;
    });

    createNode({
      id: filterId,
      parent: null,
      children: itemIds,
      internal: {
        type: "SearchFilter",
        content: JSON.stringify(filter),
        contentDigest: createContentDigest(filter)
      },
      ...filter
    });
  });

  // We're done, return.
  return;
};
