const fetch = require("node-fetch");
require("abort-controller/polyfill");

const { createNexusClient } = require("@bbp/nexus-sdk");
exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest
}) => {
  const { createNode } = actions;

  const nexus = createNexusClient({
    uri: "http://staging.nexus.ocp.bbp.epfl.ch/v1",
    fetch
  });

  const orgs = await nexus.Organization.list();
  orgs._results.forEach(async org => {
    const orgNodeId = createNodeId(`nexus-organization-${org["@id"]}`);
    const projects = await nexus.Project.list(org._label);
    const projectNodesIds = projects._results.map(project => {
      const projectNode = {
        id: createNodeId(`nexus-project-${project["@id"]}`),
        parent: orgNodeId,
        children: [],
        internal: {
          type: `NexusProject`,
          content: JSON.stringify(project),
          contentDigest: createContentDigest(project)
        }
      };
      createNode({ ...project, ...projectNode });
      return projectNode.id;
    });

    const orgNode = {
      id: orgNodeId,
      parent: null,
      children: projectNodesIds,
      internal: {
        type: `NexusOrganization`,
        content: JSON.stringify(org),
        contentDigest: createContentDigest(org)
      }
    };
    createNode({ ...org, ...orgNode });
  });

  // We're done, return.
  return;
};
