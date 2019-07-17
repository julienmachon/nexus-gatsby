const path = require(`path`);

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  Array.from({ length: 9 }).forEach((_, id) =>
    createPage({
      path: `/character/${id}`,
      component: path.resolve("src/components/character.tsx"),
      // Send additional data to page component
      context: {
        id
      }
    })
  );
};
