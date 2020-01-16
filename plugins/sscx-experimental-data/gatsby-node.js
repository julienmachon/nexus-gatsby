const { createNexusClient } = require("@bbp/nexus-sdk");
const fetch = require("node-fetch");
require("abort-controller/polyfill");

const experimentalLayers = () => `
# List all layers (looking at the ones available in ReconstructedCells)
prefix nsg: <https://neuroshapes.org/>

SELECT DISTINCT ?layer ?layerLabel
WHERE {
  ?s rdf:type nsg:ReconstructedCell ;
     nsg:brainLocation / nsg:layer ?layer .
  ?layer rdfs:label ?layerLabel
}
`;

const experimentalMtypes = layerId => `
# List all m-types of specific layer
prefix nsg: <https://neuroshapes.org/>

SELECT DISTINCT ?mtype ?mtypeLabel
WHERE {
  ?s rdf:type nsg:ReconstructedCell ;
     nsg:brainLocation / nsg:layer <${layerId}> ;
     nsg:mType ?mtype .
  ?mtype rdfs:label ?mtypeLabel
}
`;

const experimentalEtypes = () => `
# List all e-types
prefix nsg: <https://neuroshapes.org/>

SELECT DISTINCT ?etype ?etypeLabel
WHERE {
  ?s rdf:type nsg:PatchedCell ;
     nsg:eType ?etype .
  ?etype rdfs:label ?etypeLabel
}
`;

const experimentalMEtypes = (mtypeId, etypeId = undefined) => `
# list me-type instance
prefix nsg: <https://neuroshapes.org/>
prefix prov: <http://www.w3.org/ns/prov#>
prefix schema: <http://schema.org/>

SELECT DISTINCT ?from ?label
WHERE {
  ?s rdf:type nsg:ReconstructedCell ;
     nsg:mType <${mtypeId}> ;
     prov:wasDerivedFrom / prov:wasRevisionOf ?from .
  ?from schema:name ?label .
  ${etypeId !== undefined ? `?from nsg:eType <${etypeId}> .` : ``}
}
`;

const experimentalExperiments = etypeId => `
# List experiments (e-types)
prefix nsg: <https://neuroshapes.org/>
prefix schema: <http://schema.org/>

SELECT DISTINCT ?s ?experimentName
WHERE {
  ?s rdf:type nsg:PatchedCell ;
     nsg:eType <${etypeId}> .
  ?s schema:name ?experimentName
}
`;

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest
}) => {
  const { createNode } = actions;

  const nexus = createNexusClient({
    uri: "https://bbp.epfl.ch/nexus/v1",
    token: process.env.NEXUS_TOKEN,
    fetch
  });

  // List all layers and their IDs
  const layers = await nexus.View.sparqlQuery(
    "bbp",
    "somatosensorycortex",
    "nxv:defaultSparqlIndex",
    experimentalLayers()
  ).then(data =>
    data.results.bindings.map(filter => ({
      id: filter.layer.value,
      label: filter.layerLabel.value
    }))
  );

  // List all e-types
  const etypes = await nexus.View.sparqlQuery(
    "bbp",
    "somatosensorycortex",
    "nxv:defaultSparqlIndex",
    experimentalEtypes()
  ).then(data =>
    data.results.bindings.map(filter => ({
      id: filter.etype.value,
      label: filter.etypeLabel.value
    }))
  );

  // for each layer, get all m-types
  const mtypes = await Promise.all(
    layers.map(
      async layer =>
        await nexus.View.sparqlQuery(
          "bbp",
          "somatosensorycortex",
          "nxv:defaultSparqlIndex",
          experimentalMtypes(layer.id)
        ).then(data =>
          data.results.bindings.map(data => ({
            id: data.mtype.value,
            label: data.mtypeLabel.value,
            layerId: layer.id
          }))
        )
    )
  ).then(data => data.reduce((prev, curr) => [...prev, ...curr], []));

  // For each m-types, List all me-types
  const metypes = await Promise.all(
    mtypes.map(
      async mtype =>
        await nexus.View.sparqlQuery(
          "bbp",
          "somatosensorycortex",
          "nxv:defaultSparqlIndex",
          experimentalMEtypes(mtype.id)
        ).then(data =>
          data.results.bindings.map(data => ({
            id: data.from.value,
            label: data.label.value,
            mtypeId: mtype.id
          }))
        )
    )
  ).then(data => data.reduce((prev, curr) => [...prev, ...curr], []));

  // For each e-type, list all e-types experiments
  const etypesExperiments = await Promise.all(
    etypes.map(
      async etype =>
        await nexus.View.sparqlQuery(
          "bbp",
          "somatosensorycortex",
          "nxv:defaultSparqlIndex",
          experimentalExperiments(etype.id)
        ).then(data =>
          data.results.bindings.map(data => ({
            id: data.s.value,
            label: data.experimentName.value,
            etypeId: etype.id
          }))
        )
    )
  ).then(data => data.reduce((prev, curr) => [...prev, ...curr], []));

  // time to create our nodes
  layers.forEach(layer =>
    createNode({
      id: layer.id,
      label: layer.label,
      parent: null,
      children: [],
      internal: {
        type: "ExperimentalLayer",
        content: JSON.stringify(layer),
        contentDigest: createContentDigest(layer)
      }
    })
  );

  etypes.forEach(etype =>
    createNode({
      id: etype.id,
      label: etype.label,
      parent: null,
      children: [],
      internal: {
        type: "ExpreimentalEtype",
        content: JSON.stringify(etype),
        contentDigest: createContentDigest(etype)
      }
    })
  );

  mtypes.forEach(mtype =>
    createNode({
      id: mtype.id,
      label: mtype.label,
      parent: mtype.layerId,
      children: [],
      internal: {
        type: "ExpreimentalMtype",
        content: JSON.stringify(mtype),
        contentDigest: createContentDigest(mtype)
      }
    })
  );

  metypes.forEach(metype =>
    createNode({
      id: metype.id,
      label: metype.label,
      parent: metype.mtypeId,
      children: [],
      internal: {
        type: "ExpreimentalMEtype",
        content: JSON.stringify(metype),
        contentDigest: createContentDigest(metype)
      }
    })
  );

  etypesExperiments.forEach(experiment =>
    createNode({
      id: experiment.id,
      label: experiment.label,
      parent: experiment.etypeId,
      children: [],
      internal: {
        type: "ExpreimentalExperiment",
        content: JSON.stringify(experiment),
        contentDigest: createContentDigest(experiment)
      }
    })
  );

  // We're done, return.
  return;
};
