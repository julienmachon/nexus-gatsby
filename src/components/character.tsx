import * as React from "react";
import { graphql } from "gatsby";

export const query = graphql`
  query Character($id: Int!) {
    rickAndMorty {
      character(id: $id) {
        name
      }
    }
  }
`;
const Character: React.FunctionComponent<{
  data: any;
}> = ({ data, ...rest }) => {
  console.log(rest);
  return <div>{data.rickAndMorty.character.name}</div>;
};

export default Character;
