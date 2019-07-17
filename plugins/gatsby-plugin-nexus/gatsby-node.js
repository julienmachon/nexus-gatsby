const fetch = require("node-fetch")
require("abort-controller/polyfill")

const { createNexusClient } = require("@bbp/nexus-sdk")
exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode } = actions

  const nexus = createNexusClient({
    uri: "https://bbp-nexus.epfl.ch/v1",
    fetch,
  })
  // Create nodes here, generally by downloading data
  // from a remote API.
  const data = await nexus.Realm.list()
  // Process data into nodes.
  data._results.forEach(datum => {
    console.log(datum)
    const nodeContent = JSON.stringify(datum)
    const nodeMeta = {
      id: createNodeId(`nexus-${datum["@id"]}`),
      parent: null,
      children: [],
      internal: {
        type: `Nexus`,
        content: nodeContent,
        contentDigest: createContentDigest(datum),
      },
    }
    createNode({ ...datum, ...nodeMeta })
  })

  // We're done, return.
  return
}
